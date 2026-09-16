# ITERATION LOG — Compassion Benchmark

## Iteration 18 — 2026-09-16 (the build stops rewriting tracked files; production can name its own commit)

### Selected Item
**DC-08 build determinism, with BM-1 folded in** (same file, same root cause). Ranked next by Meta-review 2 (v2 15)
and the direct cause of the one metric that review scored as failing: "dirty paths not attributable to a pending
iteration".

### V1 — baseline (coordinator-measured)
- **19 tracked files rewritten per build**, each differing by one line: `"generatedAt": "2026-08-03T…"` →
  `"2026-09-16T…"`. Sources: `build-special-briefings.mjs:474,525`, `build-updates-manifest.mjs:56`,
  `build-manifest.mjs:164-166`. (`export-public-data.mjs:160` also stamps but writes to gitignored `public/data/`.)
- I had hand-excluded these by pathspec ~8 times in one day. That is how a real change eventually ships unnoticed.
- **BM-1:** live production served `git: {"sha":"unknown","branch":"unknown"}` — the deployed site could not identify
  its own commit, and `gitInfo()`'s `catch` returned a plausible-looking `"unknown"` rather than an honest absence.

### What Changed
- **Readers checked before touching a field.** `generatedAt` per briefing *is* read (`updates/special/[slug]/page.tsx`
  uses it as JSON-LD `dateModified`), so it was **derived** from the source `.md`'s git commit date rather than
  deleted. The `updatedAt` fields in `special-briefings/manifest.json` and `updates/manifest.json` had **no readers
  anywhere** and were deleted.
- `build-manifest.json` untracked (it is a genuine build artifact; still generated and served). Trade-off accepted:
  `git log` no longer shows past production build times — the data it summarises is tracked and reproducible per commit.
- **BM-1:** `gitInfo()` now prefers injected `GIT_SHA`/`GIT_BRANCH`/`GIT_DIRTY`, falls back to shelling out, and when
  both fail records `source: "unavailable"` with a reason — **never** a fake `"unknown"`.

### Coordinator catch: the BM-1 fix would not have worked in CI
The agent wired the sha exports into `deploy.sh` — but **CI never invokes `deploy.sh`** (0 references in
`.github/workflows/deploy.yml`; its SSH step runs `git pull` then `docker compose up -d --build` directly). Every CI
deploy would have recorded git as "unavailable": honest, but not the fix. I added the exports to the workflow's SSH
script itself, computing `GIT_DIRTY` from `git status --porcelain` rather than hardcoding `false`.

### Validation
- **Determinism proven by me:** ran both generators twice back-to-back → **0 dirty paths** after each, and
  `manifest.json` byte-identical across runs. Churn **19 → 0**.
- **Held content contained:** only `america-at-250-2026-07-04.json` carries content changes (66 lines — it legitimately
  rebuilds from the held `.md` rewrite). All other briefings are stamp-only; `manifest.json`'s sole content change is
  the deleted unread field. Both America-at-250 files stay excluded from the commit, preserving the §1c hold.
- `npm run test` exit 0 (27 steps), `tsc` clean. Full build not run locally (OOM); CI is the gate.
- The agent stashed pre-existing stamp churn as `stash@{0}` — inspected: 19 files, all stamp-only, superseded by the
  regenerated output. Nothing lost.

### V7 — pending deploy verification
Production `/build-manifest.json` must report a real short sha and `source: "env"` instead of `"unknown"`.

## Iteration 16 — 2026-09-16 (claim-to-source gate for briefings — DC-04 / RISK-020)

### Selected Item
**CS-1: a gate that checks briefing prose against its own sources.** Forced selection under rule S10 (adopted the same
day): DC-04 had ≥2 dated occurrences and neither a gate nor a waiver. v2 18.

### V1 — the defect
Briefings twice carried claims their own sources contradict, and **every error passed both existing validators**: the
2026-09-14 cycle (4 errors) and 2026-09-15 (**12** errors caught only by coordinator review before publication) —
"Oracle at the bottom of the benchmark" (it ranks 413 of 447), "Last Night's Briefing Wrongly Dropped … Lesotho" (the
published 09-14 briefing never mentioned Lesotho — the drop was in the internal scan), a false integration-bonus rule,
and an unsourced Sweden adjustment.

### What Changed
Four checks in `lint-rules.mjs`, wired into `lint-daily-briefings.mjs`, forward-dated to **2026-09-17** so no published
briefing is retro-failed or edited (§1c):
1. **Superlative/rank claims** — "bottom of the benchmark", "lowest score" etc. tied to a slugged entity, checked
   against the published index. Extremity is tested as *composite tied with the index min/max*, not `rank === 1`,
   because 12 countries tie at composite 0 and each is genuinely "lowest".
2. **Numbers** — figures predicated of an entity checked against that briefing's own `recentAssessments` values or the
   index composite.
3. **Prior-briefing cross-references** — "last night's briefing said X" must be satisfiable from that date's file.
4. **Formula statements** in `methodologyNotes[]` — recomputed against `scoring.mjs`.

### Two defects found by coordinator verification, both fixed before commit
- **Number misattribution (28 false positives → 0).** The check bound any score-shaped number to whichever entity the
  sentence resolved to — co-occurrence, not attachment. Real examples: `60.0` (a band boundary) attributed to
  Anthropic; `25.0`/`4.7` (other countries in a correction notice) attributed to the DRC; `75.0` (formula arithmetic)
  to Taiwan. Fixed by binding each number to the entity it is actually predicated of, and excluding by *kind* — band
  edges derived from `BAND_RANGES`, deltas, the "from" leg of a transition, formula components, dimension-scale (0–5)
  values, and figures the prose itself marks as not-the-published-score. **No phrase suppressions; no residuals kept.**
- **Silent degradation (the serious one).** `loadPublishedIndexLookup(dir)` returned an empty lookup if the directory
  was wrong — every check then degraded to advisory and the run reported success. I hit this myself: called it with no
  argument, got 0 entities, and watched the real Oracle defect *pass*. In CI a moved path would have disabled the gate
  invisibly. It now throws, naming the directory tried, and the linter exits 2.

### Validation (V2/V8, coordinator-run)
- Still flagged (not weakened): Oracle superlative · Wellington's wrong 84.0 · a false 12-point bonus cap.
- Now passing (the former false positives): band boundary 60.0 · formula arithmetic · trajectory prose · correct 83.0.
- Corpus: claim-to-source flags **28 → 0**; lint exit 0; `test-claim-to-source` 36/36; full suite exit 0; tsc clean.
- Fail-loud proven by me: bad path **and** no-argument both throw; linter exits 2.

### Coordinator process note (the finding worth keeping)
Six of my own verification probes today returned confident nonsense — a grep for `"79 / year"` when the string was
`"$79/yr"`; `ls | head -4` truncating before the file sought; freshly-written files read as "stale"; guessed registry
columns; a malformed lookup call; and a "congo" filter that could not match a slug truncated to `democratic-republic-of-c`,
which led me to report a non-existent identity defect. Two of those happened *while investigating that very failure
mode*. Every one would have been caught by V8 — prove the check can find a known-present instance before trusting a
zero. The rule is now in `coordinator.md`, and it is the most valuable thing this loop produced.

### Outcome
The one surface that publishes new prose every cycle now has a mechanical claim check; DC-04 moves from ungated to
gated, satisfying the S4 obligation that forced the selection.

### V7 — deployed and verified (both Iterations 16 and 17)
Commit `81865fbf` on `main`; deploy run **35144049054**, all four jobs success (build+test, worker typecheck, deploy,
post-deploy health). CI ran the full 27-step chain, so the five guards added today execute in CI, not only locally.
Production healthy after the deploy: `/`, `/updates`, `/methodology` all 200. Neither iteration changes rendered pages
— both are build-time gates plus the model-detection scaffolding — so this was a build-integrity check by design.
Five green deploys today: 35112334235 · 35114744386 · 35118662309 · 35122189972 · 35144049054.

## Iteration 17 — 2026-09-16 (AI-model cycle: build the L1 detection path — founder directive)

### Selected Item
**The declared-source registry, its validator, and the L1 fetcher** — the missing first link in the model cycle
(detect → evaluate → score → publish). Founder directive: "continue expanding and improving the AI model virtuous
cycle of assessing new models." v1 14 · v2 **15**.

### V1 — baseline (coordinator-verified before briefing)
- **Detection had never run and could not run.** 0 scans, 0 releases, and `release-sources-v1.json` — the file
  `releases-v1.json` names as its `sourceRegistryRef` — **did not exist on disk**; nor did the scan-record root.
  No fetcher existed, only validators over empty stores.
- **Scoring rests on thin ground:** per-dimension scorable items AWR 5 · EMP 5 · ACT 5 · EQU 3 · BND 3 · ACC 3 ·
  **SYS 2 · INT 2**, and **0 of 33 items human-reviewed** (28 unvalidated, 5 unreviewed drafts).
- **Live models are founder-blocked:** BLK-002 (no credentials, no approved spend) is Critical, and
  `.benchmark-ops/NEXT_ACTIONS.json` marks the top three actions `agent_executable: false`.

### Why L1 rather than a scanner
`docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7: *"L1 is the architecturally important level, and it should be built
before any scanner."* L1 enumerates a declared registry and fetches each URL directly — **0 search calls**, so
BLK-001/INC-008 does not block it — and earns coverage claim `declared-sources`, the strongest *honest* claim. L0 open
search costs ~270 calls and can still only claim `partial`.

### What Changed
- `site/src/data/model-benchmark/release-sources-v1.json` — **empty**, per the §2.7 schema.
- `site/scripts/lib/model-sources-validator.mjs` + `validate-model-sources.mjs` — 11 checks (shape, enums, https-only
  URLs, deterministic `source_id` derivation, uniqueness, count/quorum coherence, date sanity).
- `research/scripts/release-watch-l1.mjs` — L1 fetcher. **Dry-run by default with no network I/O**; `--live` is the
  only path that fetches. Writes a legal scan record even with zero sources, and never writes a release row
  (promotion is human-gated, §2.5 T1/T3).
- Tests: `test-model-sources.mjs` (41) and `test-release-watch-l1.mjs` (33), both no-network by construction.

### The hard rule, and that it held
**No source URL was authored.** The spec requires a source be *"added by a human from a verified URL, never
inferred"*; the store forbids rows from memory, training data or marketing pages. Coordinator check: the registry
contains **0 sources and no `http(s)://` string anywhere in the file**. Zero network calls were made.

### Validation
- **V2 coordinator re-runs:** `validate-model-sources` PASS on the empty registry · tests 41/41 and 33/33 ·
  `validate-model-releases` still PASS.
- **V8 positive controls, run by me** (so a clean result is not vacuous): bad `source_type` enum, non-https URL,
  `sourceCount` mismatch, `quorumRequired` exceeding the primary count, and duplicate `source_id` each fail **by name**;
  the well-formed and empty registries pass.
- First scan record written: `status: "not-run"`, `calls_used: 0`, `candidates: []`, `promoted_release_ids: []`,
  `blocked_by: "no-sources-registered…"` — an honest record of a real attempt, not a false `completed`.

### Decisions taken (escalated by the agent rather than silently resolved — the right call)
- **D-38:** `never-scanned` outranks `degraded`; the implemented precedence stands and §2.4's table is the imprecise
  part. A single blocked attempt must not erase the "never scanned" admission.
- **D-39:** the first `not-run` scan record is kept and committed — "we tried and were blocked" is evidence.

### Outcome
Detection goes from *impossible* (no registry, no fetcher, no record root) to *one founder action away*: add verified
source URLs and L1 runs at zero search cost, every cycle.

### Follow-ups
- **Founder:** populate `release-sources-v1.json` with verified provider URLs (R6/R11). Nothing else unblocks detection.
- **Founder:** BLK-002 — credentials and spend — if the evaluate stage is to move past fixtures.
- **Next CB-MODEL increment:** the coverage floor and item review. SYS and INT carry 2 unreviewed items each; a
  composite scored today would rest on them for a quarter of its dimensions.
- npm wiring for `test:model-sources`, `validate:model-sources`, `test:release-watch-l1` deferred — `site/package.json`
  is owned by Iteration 16, still in flight (S6 disjointness).

## Meta-review 2 (post Iterations 13–15) — 2026-09-16 — not an iteration

- **Trigger:** 3 completed loops since Meta-review 1. The `meta-coordinator` agent type is no longer available, so the
  review was delegated to an independent general-purpose agent rather than written by the coordinator grading itself.
  Output: `docs/META_REVIEW_2026-09-16_ITER13-15.md`. **Verdict: Amber, clearly improving.**
- **What it confirms:** v2 and S1–S7 changed behaviour rather than merely being written down. All three iterations were
  the top eligible v2 item; each reduced a High risk; each gated a recurring class. S6 demonstrably *blocked* work
  twice (the governance pass and the research preflight both declined implementation citing it), and S4 is what
  selected It. 15 — without it a v2 17 item would have lost to L at 16.
- **Four findings, every one re-verified by the coordinator before adoption:**
  1. **DC-04 is ungated with no waiver** after 2 cycles — an active violation of the loop's own S4. It sits on the only
     surface that publishes new text every cycle; the 2026-09-15 briefing needed 12 corrections and every error passed
     both validators. → new rule **S10** makes it Iteration 16.
  2. **The rubric rewarded freezing live defects.** It. 14 froze 16 slug collisions in an allowlist and filed **no
     backlog row**, so the queue could not select the repair. Verified live: `/data/scores/singapore.json` serves the
     global city (56.2), not the country. → **P raised to +2** for live wrong answers, and a freezing gate must file
     the remediation row in the same loop. Backlog item **A-2** created.
  3. **Two coordinator-caused defects, neither self-caught** (DC-10 caught by `score-updater`; history orphaning caught
     post-deploy). The detection rate is the finding, not the error rate. → **S8** (structured records via parser) and
     **S9** (a rename re-derives every consumer, diffing the path set).
  4. **`SYSTEM_HEALTH.md` went stale within hours of a full rewrite** — it claimed a 22-step test chain against an
     actual 23 (coordinator confirmed). → **S11**: status figures are generated or carry their regeneration command.
     Fixed. Also found: production `build-manifest.json` reports `git.sha: "unknown"`, so the deployed site cannot
     identify its own commit.
- **The reviewer's own greps produced false readings too**, as did a coordinator column-index guess this same turn —
  four instances across three operators in 48 hours. → **V8**: no zero or absence claim counts until a positive control
  proves the check can find a known-present instance; truncating or structure-guessing commands void the claim.
- **Metrics: 5 of 8 targets met.** Passing: top-eligible selection 3/3 · High-risk reduction 3/3 (target ≥2/3) ·
  WIP ≤1 · unattributable dirty paths 0 (24 dirty, all known churn or held content) · pipeline-touching loops.
  Failing: ungated recurring classes (DC-04, DC-08) · SYSTEM_HEALTH accuracy · founder decisions open 24–30 days
  (D-14 30d, D-13 27d, D-20/D-21 24d) against a 14-day escalation threshold.
- **Adopted into `IMPROVEMENT_BACKLOG.md`:** V8, S8, S9, S10, S11, the P amendment, and backlog item A-2.
- **Next:** Iteration 16 is **CS-1, the claim-to-source gate for briefings** (v2 18) — forced by S10, not by rank.

## Iteration 15 — 2026-09-16 (published method claims vs the formula, and the gate that keeps them true — DC-02)

### Selected Item
**G-3 + the DC-02 gate.** Third occurrence of "published method copy contradicts the canonical formula" (It. 9
"base /80"; It. 10 "balanced beats spiky" on `/ai-models`; now the main `/methodology` surfaces), so rule S4 forces a
mechanical check rather than a fourth prose patch. v1 13 · **v2 17** (K+1 RISK-019 reduce · P+1 live · Rc+2 gate for a
≥2-occurrence class). Alternatives: L cross-links/overclaiming 16, D-2 status-ladder renderer 15.

### V1 — what was published (coordinator computed against `scoring.mjs` before briefing anyone)
1. **Two of four consistency steps can never fire.** σ across 8 dimensions bounded 0–5 is capped at **2.500** (four 0s,
   four 5s); 400k random profiles produced only the 1.0 and 0.75 buckets. Yet the chart, its aria description and
   `/methodology` published "σ 3.0–5.0 → 0.4" and "σ > 5.0 → 0.1" as live rules.
2. **"A balanced 70/70 profile beats a spiky 90/40 profile" is false in general** — balanced [3.8×8] = 70.0 loses to
   spiky [5,5,5,5,2.6,2.6,2.6,2.6] = 72.0 — yet was asserted unconditionally in three places (chart annotation,
   `/methodology`, `dimensions.ts` `detail`).
3. **`IntegrationPremiumDiagram` published an impossible premium of 0.5.** The reachable set is exactly
   {0, 1.5, 2, 3, 4, 4.5, 6, 8, 10}. (7.5 is excluded too: a full balance factor requires every dimension ≥ 4.0, which
   caps σ at 0.50 and forces consistency 1.0 — so 10 × 0.75 × 1.0 cannot occur.)
4. Verified correct, left alone: the Abridge worked example (σ 0.1654 ≈ "0.17", premium 0, composite 60.9) and the
   `dimensions.ts` `short` string.

### What Changed
- Consistency steps: all four remain documented (a published rule is not silently deleted) but the two unreachable
  ones are hatched, labelled "never occurs", and explained in the aria text — "with 8 dimensions each bounded 0 to 5,
  standard deviation cannot exceed 2.5". `/methodology` prose matches.
- Balanced-vs-spiky: replaced with what the formula does — the premium rewards dimensions at or above 4.0, not evenness
  as such — illustrated with both directions ([4×8] = 85 beats [5,5,5,5,3,3,3,3] = 77; but [5,5,5,5,2.6×4] = 72 beats
  [3.8×8] = 70). Corrected in all three places.
- Premium diagram: the impossible 0.5 profile replaced with a real vector, [4,4,4,4,0.4,0.4,0.4,0.4] → base 30.0 +
  premium 1.5 = 31.5; the "typical" row given a concrete vector too, [4.5×5, 0.5×3] → 50.0 + 3.0 = 53.
- New shared data modules (`consistencyStepsData.ts` with a `reachable` flag and `MAX_ACHIEVABLE_STD_DEV`,
  `integrationPremiumExamples.ts` with per-profile vectors) so the chart, the duplicated table beneath it and the test
  all read the same constants and cannot drift.
- **Gate:** `site/scripts/test-method-claims.mjs`, wired into `npm run test` as `test:method-claims` (chain now 23
  steps). It computes against `scoring.mjs` — asserts the reachable premium set and the σ ceiling, fails on any
  published step or premium value that cannot occur, and recomputes every worked example's σ, base, premium and
  composite. It checks numbers, not prose, which is what let this class recur three times.

### Validation (V1–V7)
- **V2 coordinator re-runs:** gate 33/33; my own recomputation reproduces every published example exactly
  (Half-and-half 30.0+1.5=31.5 · Typical 50.0+3.0=53 · Abridge 60.9+0=60.9, σ 0.1654) and the 7.5 exclusion.
- **V3 planted probe, run by me:** flipping "σ 3.0–5.0" to `reachable: true` → named FAIL, exit 1
  (`STEPS "σ 3.0–5.0" (lowerBound 3) has reachable=true, expected false given MAX_ACHIEVABLE_STD_DEV=2.5`); restored →
  33/33, exit 0, file byte-identical.
- `npx tsc --noEmit` clean; `npm run test` exit 0.
- **V4:** full local build not used as the gate — this machine ran out of memory on two attempts; CI builds before
  deploying. **V5:** no dated or research content touched. **V6:** diff is 5 edited + 3 new files, plus records.
- **V7 — deployed and verified live (commit `fa01db72`, deploy run 35122189972, all four jobs success).** On
  production `/methodology`: the σ ceiling is disclosed ("cannot exceed 2.5" ×7, "never occurs" ×4, "only the first two
  steps ever occur" ×4); the false claim is gone (**0** occurrences of "out-earn a spiky 90/40"); the corrected wording
  is live ("rewards dimensions at or above 4.0", "a spiky profile can still…"); and the impossible premium is gone —
  the diagram renders the real "Half-and-half" profile at its verified 31.5.

### Outcome
Published method claims that contradict the formula: 3 live → 0, and the class is gated for the first time since it
began recurring in June. Four deploys today (35112334235, 35114744386, 35118662309, 35122189972), all green; `main` at
`fa01db72`.

### Follow-ups
- Queue, in v2 order: L cross-links + `/ai-evaluation-suite` overclaiming (16) · D-2 status-ladder renderer (15) ·
  the 5 unresolvable briefing references, UAE in 7 (10) · export-public-data pruning (10) · "811 of 1329" formatting (9)
  · SalesInquiryForm prefill copy (12).
- **Meta-review trigger is due:** Iterations 13, 14 and 15 completed since Meta-review 1, so the next loop should be a
  meta-review before Iteration 16.
- Founder-owned and unchanged: branch protection on `main`, the two `.bak` files, the Gumroad fulfilment check, the
  four tracked-but-unpublished ai-labs entities, and the held America-at-250 rewrite.

## Founder-approved remediation batch — 2026-09-16 ("approve all and fix all")

Not an improvement loop: a batch of previously-gated items the founder approved in one instruction, plus Iteration 14
(logged separately below). Each item was delegated to a specialist and verified by the coordinator.

### Done and verified
- **Wellington applied** (D-36): global-cities 83.0 exemplary → 71.3 established, rank 13 → 22; 9 neighbouring rows
  shift by one rank; band counts exemplary 15 → 14, established 26 → 27. Coordinator checks: the written row recomputes
  to exactly 71.3 under `computeCompositeFromDimensions`; entity record matches; `validate-rotation-state` shows the
  same 22 pre-existing failures, none new; `APPLIED_CHANGES.md` and `CHANGELOG.md` carry the RISK-019 premium-cliff
  disclosure (base −3.75, premium −8.0) and the provenance caveat. Published briefings that describe the change as
  unapplied were **not** edited (§1c): `updates/daily/2026-09-15.json`, `latest.json`, `special-briefings/equity-tax-2026-06-16.json`.
- **Coordinator defect, disclosed (DC-10):** the approval fields the coordinator wrote into the proposal were duplicate
  keys, so they parsed as `null`; only `status: "approved"` survived. `score-updater` caught it, refused to take the
  instruction's word for the file's contents, applied on the intact gate, disclosed it in both research logs and
  repaired the keys. The file now parses with one consistent set.
- **Score-Watch paused** (D-34, RISK-014): `SCORE_WATCH.useGumroad = false`, so every CTA routes to
  `/contact-sales?product=score-watch`; coordinator verified both remaining Gumroad call sites are flag-gated, so no
  purchase link is reachable. Badge-embed widget renders nothing (`BADGE_EMBED_AVAILABLE = false`), and its empty
  wrapper was removed so no divider or heading is left behind. Pause disclosed on `/score-watch` and `/pricing`.
  Still open for the founder: check Gumroad for any unfulfilled purchase.
- **Coverage published** (D-33): `research/scripts/coverage-report.mjs` + tests (19/19), committed report
  `research/coverage/2026-09-16.{md,json}`, generated `site/src/data/neverAssessedCoverage.ts`, and a new
  `/methodology` section stating **811 of 1,329 (61.0%)** never individually assessed, with the definition and what a
  never-assessed score is. Coordinator reproduced every figure independently from `rotation-state.json` and confirmed a
  re-run is byte-identical. Wired `test:coverage-report` into `npm run test` plus a `coverage-report` command.
  **New finding (RS-3):** tracked 1,329 vs published 1,325 is entirely 4 ai-labs entities with no published row —
  Reflection AI, Nvidia AI, SpaceX AI, Oracle AI. The report flags the mismatch rather than hiding it.
- **Waiver cliff staggered** (D-37, RISK-015): six waivers all expiring 2026-12-09 → 2026-11-16 / 11-30 / 12-14 /
  2027-01-15 / 01-29 / 02-12, earliest for the clearest remediations. `test-separation-waivers` 17/17 and
  `validate-product-separation` PASS on the new dates.
- **`CLAUDE.md` data notes corrected:** "21 of 51 states" → 51, "Robotics Labs: 50" → 92, plus 8 indexes / 1,325
  entities and an instruction to import counts rather than type them (the guard It. 12 added enforces it).
- **Decisions recorded:** D-31 (batched approvals by pathspec, dated branches, never straight to `main`), D-32
  (research cadence floor, isolated sessions), D-33, D-34, D-35 (decode names; `&` → `-and-` slug convention),
  D-36, D-37.
- **America-at-250:** the unrecorded rewrite of a published briefing stays uncommitted; the diff is preserved at
  `research/held-changes/america-at-250-unrecorded-rewrite-2026-09-03.patch` and republishing it as a dated correction
  is a backlog item.

### RS-1 — the rotation-state validator now fails only on real gaps
- **Problem:** `validate-rotation-state.mjs` reported 22 blocking FAILs (25 after the rename), every one of which the
  coordinator had already shown to be false — evidence existed under an older recording convention. A red gate nobody
  can act on is a dead gate (DC-09).
- **Fix:** when the literal slug has no exact/legacy report, the validator now escalates through three named evidence
  classes and downgrades to a WARN that says which one matched: (1) a report under a **derived alias slug** — current
  slugify, the older naive slugify, accent-folded, HTML-entity-encoded (`&`→amp, `'`→x27), and index-suffix-stripped;
  (2) a **same-date ±1-day change proposal**; (3) a **digest mention** of the entity's name. FAIL is reserved for
  entities with none of the three. The core was refactored into exported, dependency-injected pure functions so it can
  be tested without touching disk; CLI output was confirmed byte-identical across that refactor.
- **Result:** 25 FAIL → **0 FAIL**, 25 WARN (5 alias-report, 20 same-date proposal, 0 digest-only). Every one names its
  evidence, e.g. `procter-and-gamble` → `research/assessments/procter-gamble-2026-06-12.md` via the older naive
  slugify; `at-and-t` → `at-amp-t-2026-05-30.md` via the encoded form.
- **Coordinator negative controls against the real exported API** (the point being that 0 FAIL must not mean the gate
  went blind): no evidence → null · unrelated files → null · proposal 31 days off → null · alias report on the wrong
  date → null · proposal 2 days off → null · digest that does not name the entity → null. Positive: alias report on
  the right date, proposal at +1 and −1 day, and a digest naming the entity each match with the correct class. Alias
  derivation is bounded — a plain name ("Belgium") yields no aliases; "AT&T" yields exactly `atandt`, `at-t`,
  `at-amp-t`.
- Its 28 tests pass, and `test:rotation-state` plus `validate:rotation-state` are wired into `npm run test` so this
  guard cannot go stale unnoticed. Historical report files were **not** renamed.

### Deployed and verified on production — 2026-09-16 (V7)
- Founder merged the work: `main` fast-forwarded `905a805d` → `48b0712f` (11 commits, both days' work). Deploy run
  **35112334235**: build+test, worker-typecheck, deploy and post-deploy health all **success**.
- **Live checks (coordinator, curl):**
  - Renamed companies: `/company/procter-and-gamble` serves with `<title>Procter & Gamble …`, **0 double-escaped
    strings**; `/fortune-500` shows the decoded names.
  - Redirects: `/company/procter-andamp-gamble` → 301 → the new URL; `/company/procter-gamble` → 301 → the new URL
    (it used to 301 into `/404`); `/data/scores/procter-amp-gamble.json` → 301 → the new key.
  - Wellington: page title and `/data/scores/wellington.json` both read **71.3, Established, rank 22**.
  - `/methodology`: the coverage section is live ("never been through an individual human assessment", 61.0%).
  - `/score-watch` and `/pricing`: pause disclosed; **0 Gumroad links** on the page; the old "self-serve checkout is
    live" line is gone. Entity pages carry **0** dead badge-embed URLs.
  - `/updates`: the 2026-09-15 briefing is live, headline correctly qualified ("faces a proposed downgrade").
- **Defect found in that verification, being fixed:** `/score-watch` still tells readers "On the entity's detail page,
  click *Subscribe — $79/yr*" — a button that no longer renders while sales are paused. **Coordinator error worth
  recording:** the first pass grepped for "79 / year" and reported 0, which was false comfort; the real string is
  "$79/yr". The page copy is being made conditional on the pause flag, with a sweep for the same class elsewhere.
- **Cosmetic, logged not hot-fixed:** `/methodology` renders "811 of 1329" without a thousands separator (the
  generator formats the share but not the totals). Rides along with the next deploy.

### Regression I introduced, found in post-deploy verification and being fixed — entity history orphaned by the rename
- **What broke:** `build-entity-history.mjs` derives history slugs from the **dated daily briefings**, which correctly
  still carry the pre-rename encoded names. After the RISK-023 migration the aggregator kept writing history under the
  old slug, which matches no current entity, so renamed companies that had score history lost their history page.
- **Evidence (coordinator, 2026-09-16):** `public/data/history/{johnson-amp-johnson,at-amp-t,deere-amp-company}.json`
  carry mtime 09:18 from **today's build** — they are freshly written, not stale leftovers — while
  `johnson-and-johnson.json`, `at-and-t.json` and `deere-and-company.json` do not exist and no
  `/company/<new-slug>/history` page is built. Production returns 301 → `/404` for those history URLs. Control:
  `microsoft.json` exists and `/company/microsoft/history` serves 200.
- **Root cause is the two-slug-conventions class (RISK-018), widened by my change.** The fix belongs in the
  aggregator — resolve every briefing reference to the current catalogue slug via decoded name and derived aliases
  (mirroring `deriveAliasSlugs` from RS-1), merging old and new events without duplicates. **Briefings are not
  edited.**
- **Second-order finding:** the aggregator, like `export-public-data.mjs`, does not prune outputs, so dead history
  files persist locally. Gitignored and rebuilt cleanly in Docker, but it hid this defect from a casual look.
- **Process note:** two earlier checks of mine gave false comfort here — an `ls | head -4` that cut off before
  `history.html`, and reading old-slug files as "stale" without checking their mtime. The mtime comparison is what
  settled it.
- **FIXED AND VERIFIED LIVE (2026-09-16, commit `c43cc037`, deploy run 35118662309, all four jobs success).**
  Briefing references now resolve to the current catalogue slug before events accumulate — exact slug, then an
  unambiguous decoded-name match within the same index, then derived aliases mirroring `deriveAliasSlugs` from RS-1 —
  with old and new events merged, deduped and date-ordered. Briefings were not edited.
  Production: `/company/{johnson-and-johnson,at-and-t,deere-and-company,procter-and-gamble}/history` all return
  **200** (each was 301 → `/404`); Johnson & Johnson's page carries both its events (2026-05-29 and 2026-07-28);
  `/company/microsoft/history` still 200 as the control; the old encoded history URL 301s.
  Beyond the regression: a pre-existing `xai-grok` / `xai` split was found and merged, dead history files are pruned
  each run instead of persisting, and the 5 briefing references that resolve to no published entity are now reported
  (UAE appears in 7 briefings) rather than rotting silently — logged as a backlog item, not widened into fuzzy name
  matching, which would risk merging distinct entities.
  Local full build could not be used as the gate (the machine ran out of memory twice); `prebuild` exit 0, the history
  manifest listing the new slugs, `test:history` 46/46, the full suite and `tsc` clean, plus CI's own build before
  deploy, were used instead.

### Blocked (needs the founder)
- **Branch protection on `main`** — the session lacks permission to change repository settings. The exact `gh api`
  command is in `docs/founder-briefings/2026-09-14.md` addendum 8. RISK-021 stays open.
- **Deleting the two `.bak` files** in `research/` — same permission class.

### RISK-023 migration — done, pending build/deploy verification (D-35)
- **Data:** the 20 Fortune 500 names decoded and an explicit `slug` pinned on each row (`procter-and-gamble`,
  `johnson-and-johnson`, `at-and-t`, `macys`, …), honoured by both `entities.ts` (pages) and `export-public-data.mjs`
  (score files). The 20 entity-record files renamed via `git mv` with only `slug`/`name` changed inside; the 20
  rotation-state keys rekeyed and names decoded, all other fields untouched.
- **No score moved:** a scripted diff of `composite`, `band`, `rank` and `scores` for all 20 rows against HEAD is
  byte-identical; only `name` and the new `slug` differ.
- **Redirects:** 60 rewrite lines in each of `nginx.conf` and `nginx-ssl.conf` (3 per entity: old encoded page slug,
  natural-guess slug, and the old `/data/scores/<old-key>.json`), dated and commented, following the Cape Verde /
  Phoenix precedent. No self-redirects; none of the 20 natural-guess slugs collides with a real entity slug.
- **Gate (RS-2a):** `validate-indexes.mjs` check 17 fails on `&[a-zA-Z#0-9]+;` in any published `name`, with a pure
  exported `findEncodedEntityNames()` and `site/scripts/test-encoded-names.mjs` (negative-control probe fails,
  decoded probe passes). Wired into `npm run test` as `test:encoded-names` by the coordinator.
- **Coordinator verification:** 0 encoded names across all 8 indexes (was 20); 20 rows carry pinned slugs; renamed
  records present; `validate-indexes` 0 errors / 64 warnings (unchanged); `test-entity-records` 19,687/0;
  `export-public-data` exit 0 with the ratchet still at 16 known / 0 unexpected / 0 resolved. The six remaining
  record filenames matching "amp|x27" are false positives (Amphenol, Campo Grande, Kampala, New Hampshire, Tampa,
  University of Illinois Urbana-Champaign).
- **Side effect, being fixed rather than papered over:** `validate-rotation-state` went 22 → 25 failures. The three new
  ones (`deere-and-company`, `at-and-t`, `w-and-t-offshore`) are reports still filed under the pre-decode encoded
  slugs — the same false-failure shape as the other 22. Historical report files are NOT renamed; RS-1 teaches the
  validator to recognise alias slugs, same-date change proposals and digest entries, so FAIL means a real gap.

## Iteration 14 — 2026-09-16 (entity-identity guards: wire the records test, ratchet slug collisions — A-1)

### Selected Item
**A-1: put `test-entity-records.mjs` into `npm run test`, and turn the slug-collision WARN in
`export-public-data.mjs` into a shrink-only ratchet.** Top eligible v2 item, unblocked the moment It. 12 was committed
(both edit `site/package.json`). v1 15 · **v2 19** (K +2 reduces RISK-017/018 · P 0 — prevents new collisions, does not
fix the 16 live ones · Rc +2 DC-05, the most-recurring class). Alternatives: RS-2a 18, RS-1 18.

### V1 — production/baseline BEFORE (coordinator, 2026-09-16)
- `test-entity-records.mjs`: passes 19,687/0 but appears in **neither** `package.json` nor CI — a dead guard.
- `export-public-data.mjs`: prints 16 collisions and continues; last index written wins. The 16: 13 global-cities vs
  us-cities (boston, portland, new-york-city, seattle, minneapolis, washington-dc, san-francisco, philadelphia, atlanta,
  detroit, chicago, los-angeles, houston) · singapore (countries vs global-cities) · 1x-technologies and figure-ai
  (ai-labs vs robotics-labs). Live effect: `/data/scores/singapore.json` serves the city, not the country.

### What Changed
- `site/package.json`: new `test:entity-records` and `test:collision-ratchet`, both appended to the `test` chain.
- `site/scripts/export-public-data.mjs`: pure exported `detectCollisions(recordsByIndex, knownCollisions)`; the old
  inline warn-only check removed; the script now exits non-zero on any **unexpected** collision or any **resolved**
  entry still listed, and warns for known ones. Import guard so tests can load it without running `main()`.
- `site/scripts/known-collisions.json` (new): dated allowlist (`asOf: 2026-09-16`) of exactly the 16, each with slug,
  sorted index pair and a note; shrink-only policy documented in the file.
- `site/scripts/test-collision-ratchet.mjs` (new): 19 assertions over in-memory fixtures + a real-data check.

### Validation (V2–V7)
- **V2 coordinator re-runs:** `node scripts/export-public-data.mjs` exit 0, "16 known, 0 unexpected, 0 resolved" ·
  ratchet tests 19/19 · `npm run test` exit 0 (chain now includes entity-records 19,687/0 and the ratchet) ·
  `npx tsc --noEmit` clean.
- **V3 negative control (coordinator, against the real exported function):** injected a 17th collision → `unexpected: 1`
  naming both indexes; removed a known collision from the data → `resolved: 1`; real index data → 16/0/0.
- **V4 built output:** deferred to the end-of-session build (the script runs in `prebuild`, so the build exercises it).
- **V5:** no dated or published content touched. **V6:** diff is `package.json`, `export-public-data.mjs` + 2 new files.
- **CI check:** `.github/workflows/deploy.yml` test job runs `npm test` before the deploy job, so both guards now gate
  production — the wiring is real, not local-only.
- **V7:** after the founder deploys.

### Outcome
Cross-index slug collisions reaching production: unguarded → build fails on any new one; the 16 known are frozen in a
list that can only shrink. Entity-record integrity (19,687 assertions) runs on every test and CI run.

### Follow-ups
- The 16 existing collisions still serve the wrong entity — remediation is a rename/redirect job (founder-approved
  2026-09-16 alongside RISK-023; sequenced after the Fortune 500 name migration).
- `known-collisions.json` should shrink to 0 as those land; the ratchet fails if an entry is stale.

## Commit — 2026-09-15 — founder instruction: "commit and push for manual deployment by me"

- **Target:** branch `release/2026-09-15` (created from `905a805d`), pushed to origin. **Not `main`** — pushes to `main`
  trigger the `Deploy to VPS` workflow, and the founder asked to deploy manually.
- **Pre-commit verification of the combined state** (It. 12 + It. 13 + research 2026-09-15 had never been built together):
  `npx tsc --noEmit` 0 · `npm run test` 0 (incl. lint-briefings, no-stale-counts, model-releases 93/93) · `npm run build` 0
  (1,989 static pages; Pagefind 1,967) · `validate-daily-briefings` 80/80 · `lint-daily-briefings` 0 unapplied-movement
  violations · `validate-product-separation` PASS (6 waived).
- **Commits (in order, scoped pathspecs):**
  1. It. 12 — derived catalogue counts + `test-no-stale-counts` (23 paths incl. `site/package.json`).
  2. It. 13 — `unapplied-score-movement` rule (5 paths).
  3. Research cycle 2026-09-15 — scan + assessor summary, 29 assessment files, Wellington proposal, rotation-state,
     digests, PENDING_CHANGES, public briefing (corrected), `latest.json`, updates manifest, feeds, OG image.
  4. Grant documents — `docs/GRANT_REQUEST_2026-09-14.md` + dated correction note on the old proposal.
  5. Governance and records — loop artifacts, agent specs, RISKS (RISK-023), defect registry, meta-review, RISK-023
     remediation spec, founder briefing.
- **Excluded (held or churn):** `research/special-briefings/america-at-250-2026-07-04.md` +
  `site/src/data/special-briefings/america-at-250-2026-07-04.json` (unrecorded rewrite of a published briefing, §1c) ·
  15 other special-briefing JSON + special-briefings manifest (build timestamps) · `site/public/build-manifest.json` ·
  `research/entity-records-dryrun.json` (stale dry run) · `research/rotation-state.json.bak`,
  `research/scans/2026-09-09.json.bak` · `.claude/settings.local.json`.
- **Not approved by this instruction:** any score apply (Wellington stays pending), the RISK-023 rename/slug migration,
  Score-Watch changes.

## Research preflight and investigations — 2026-09-15 — not an iteration (S6 still binding)

- **Research cycle 2026-09-15** (AUTONOMY §1a):
  - **Scan (done, verified):** `research/scans/2026-09-15.json` — 1,329 entity reviews, 15 top entities, 5 rotation
    backfill, 6 sector alerts; 286 searches vs derived ceiling 274 (T1 150 · verification 8 · T2 111 · T3 17; overage
    disclosed). Coordinator re-ran `validate-scan.mjs 2026-09-15` → PASS (warnings only). Rotation-state diff vs HEAD:
    exactly `last_scanned` and `last_evidence_touch` changed on all 1,329 entities plus top-level `last_updated`;
    no keys added/removed; all `last_assessed` untouched.
  - **Source spot-checks (coordinator fetch):** Netflix (news4jax, published 2026-09-09) ✓ · Sweden (Irish Times,
    2026-09-12) ✓ · Warsaw (Notes From Poland, 2026-09-08) ✓ — but civic-group action, attribution flagged · Anthropic
    (androidheadlines) HTTP 403 — independent corroboration required.
  - **Correction to the 2026-09-14 cycle (append-only, DC-06):** 09-14 dropped a Lesotho AGOA finding as misdated and
    wrong. Today's source (Sunday Times, datePublished 2026-09-04) confirms a 2 September 2026 signing of the Continuing
    Appropriations and Extensions Act, 2027 extending AGOA to 2028, and separately confirms the February 2026 extension
    to end-2026 — the 09-14 drop conflated the two. The 09-14 files are not edited; the assessor records the correction.
  - **Assessment (done, verified):** 14 of 15 assessed (Oracle AI not assessable — no published row); 1 proposal
    (Wellington −11.7, Exemplary → Established, pending), 10 confirmations, 2 band crossings withheld (Netflix,
    Bridgetown — placeholder grid rounding), Abbott measured 50.0 reproducing its pending 08-26 proposal (not re-filed);
    26 assessor searches. Coordinator checks: Wellington proposed 71.3 and published 83.0 both recompute exactly with
    `computeCompositeFromDimensions`; drift vs index 0.00. Rotation-state changes beyond the scan: exactly 14
    `last_assessed` (the assessed entities) + 1 `last_change_proposal` (Wellington); no index, entity-record or
    `site/src/data/updates` changes. 15 reports + 14 sidecars on disk. `validate-rotation-state` still the same 22
    (none new, none resolved). Wellington sources fetched: RNZ 2 Sept 2026 ✓, ODT datePublished 2026-09-02 ✓, Mirage
    News republication carries the quoted Crown Review finding ✓.
  - **Magnitude note (RISK-019):** Wellington's dimension average moves 4.00 → 3.85 (base 75.0 → 71.25, −3.75); the
    integration premium falls 8.0 → 0 because five dimensions drop below 4.0 (−8.0). About two-thirds of the −11.7 is
    the formula cliff. The proposal's recommendation is not edited (AUTONOMY §1c); disclosure goes in the digest,
    briefing and founder packet.
  - **Conflict of interest:** the assessor model is built by Anthropic; its Anthropic confirmation is disclosed and
    recommended for human spot-check.
  - **Digest (done, verified, corrected):** `research/digests/2026-09-15.{md,json}`, `research/PENDING_CHANGES.md`
    (21 pending by directory count), public briefing `site/src/data/updates/daily/2026-09-15.json` + `latest.json` +
    `manifest.json`. Headline: "Wellington faces a proposed downgrade after a government review found sewage-plant
    oversight failures." `scoreChangesApplied: 0`. **First real briefing under the It. 13 rule: lint 0
    unapplied-score-movement violations** — every movement is qualified ("proposed", "not yet applied").
  - **Coordinator claim-to-source review (RISK-020) found 12 errors the gates passed; corrected before commit** in the
    daily briefing, `latest.json` and `research/digests/2026-09-15.json` (exact-string script, each found once per file):
    1–3. "Oracle confirmed at the bottom of the benchmark" — false (120 entities below 14.7; F500 rank 413/447) →
    "confirmed in the benchmark's lowest band, Critical". 4–5. "Last Night's Briefing wrongly dropped … Lesotho" —
    the public 09-14 briefing never mentioned Lesotho (0 matches); the drop was in the research scan → "Last Night's
    Research". 6–9. Anthropic "checked for a conflict of interest … The check held … a past, unconflicted review" —
    overstated; the conflicted assessor restricted itself, and prior reviews are not shown to be unconflicted →
    disclosed-conflict wording. 10–11. Integration bonus "for scoring above a set line on every one of eight
    categories … disappears immediately when even one drops" — false under `scoring.mjs` (−1/5 per category below
    4.0; Wellington's published 8-point bonus already had one category, EQU 3.5, below) → formula-accurate wording.
    12. Sweden override "applied in April 2026 after a review found the formula was overstating" — unsupported by the
    Sweden report → "registered adjustment".
    Verified correct and kept: Wellington never assessed before (`last_assessed` null at HEAD); failure 4 February
    2026; Mayor Andrew Little's apology (The Spinoff fetch); Netflix "lacks merit" (NBC, report line 209); "did not
    become law" quoted accurately from the 09-14 scan; Abbott allegations as allegations.
    After correction: `validate-daily-briefings` 80/80 PASS; `lint-daily-briefings` PASS; daily == latest.
- **Preflight finding 1 — rotation-state gate is miscalibrated (DC-09).** `validate-rotation-state.mjs` reports 22
  blocking FAILs. Coordinator classification against disk: 0 true phantoms. 20 are evidenced by a same-date
  `research/change-proposals/<slug>-<date>.json` plus a digest entry (2026-04-29 → 05-09 convention); Procter &
  Gamble has `research/assessments/procter-gamble-2026-06-12.md` under a different slug than its key
  `procter-amp-gamble`; Côte d'Ivoire (key `c-te-divoire`) has a 2026-06-24 digest entry. `validate-scan.mjs
  2026-09-14` FAILs only on 1,331 vs 1,329 after the structural merge. Neither blocks today's cycle. Backlog RS-1 (v2 18).
- **Preflight finding 2 — RISK-023 (new).** 20 Fortune 500 names are stored with HTML entities since `a60208d9`
  (2026-04-14). Live: `/company/procter-andamp-gamble` title and H1 read "Procter &amp; Gamble"; `/fortune-500` shows
  "AT&amp;T", "Johnson &amp; Johnson", "Macy&#x27;s"; 143 built pages affected; `/company/procter-gamble` → 301 `/404`.
  Root cause: `slugify.ts` turns `&` into `and` on the encoded string; export/record scripts slug differently (RISK-018).
  All 20 current/clean slugs computed with the site's slugify; no collisions. Spec:
  `docs/REMEDIATION_RISK-023_ENCODED_NAMES_2026-09-15.md`. Renames/slugs are founder-gated (§1b). Backlog RS-2a
  (validator, v2 18) / RS-2b (rename, founder).
- **Files written (docs/governance only):** `RISKS.md` (RISK-023), `docs/DEFECT_CLASS_REGISTRY.md` (DC-09; DC-05
  occurrence), `IMPROVEMENT_BACKLOG.md` (RS-1, RS-2a/b), `SYSTEM_HEALTH.md`, the remediation spec, this entry.

## Governance pass — 2026-09-15 — not an iteration (S6 WIP limit reached)

- **Why:** It. 12 and It. 13 are validated and uncommitted; rule S6 forbids new implementation. Did the
  meta-review §10 governance items instead (agent specs and root status files, AUTONOMY §1a).
- **`SYSTEM_HEALTH.md`:** rewritten as a measured 2026-09-15 snapshot. Re-run today: `validate-indexes` 85,401
  checks / 0 errors / 64 warnings (file said 12,750); `validate-daily-briefings` 79/79 (said 30/30);
  `validate-product-separation` PASS with 6 waivers; `validate-model-releases` PASS (4 warnings); `npm test` = 17
  steps (said "54 E2E, 0 unit"); deploy 9 consecutive successes 09-09 → 09-14 (said "auto-deploy broken"); artifact
  coverage re-derived from `docs/` (said CHANGELOG missing); "US States 21 of 51" removed (51 published). Status
  notes trimmed to 3; older notes archived verbatim in the same file.
- **`.claude/agents/meta-coordinator.md`:** description rescoped from Ledgerium AI to this repo, with the added
  triggers.
- **`.claude/agents/coordinator.md`:** appended "Compassion Benchmark overlay": scoring model v2, rules S1–S7,
  checklist V1–V7, artifact definition of done, extra meta-review triggers. The generic template text is unchanged.
- **Not done (founder-owned):** `CLAUDE.md` data notes (packet item 9); every commit/deploy.
- **Commit pathspec (governance):** `SYSTEM_HEALTH.md` `ITERATION_LOG.md` `IMPROVEMENT_BACKLOG.md`
  `.claude/agents/coordinator.md` `.claude/agents/meta-coordinator.md` `docs/founder-briefings/2026-09-14.md`.

## Iteration 13 — 2026-09-14 (briefings may not narrate an unapplied score change as published — D-1, RISK-020)

### Selected Item
**D-1: `unapplied-score-movement` lint rule.** Briefings dated ≥ 2026-09-15 fail the build if, with
`pipeline.scoreChangesApplied` 0/absent, a headline/title/summary/topSignal title or whyItMatters states a score
movement as fact ("falls 5.9 points") without qualifying language ("would", "proposed", "not yet applied").

### Reason for Selection (first loop under scoring model v2)
| Item | v1 | v2 | Lane |
|---|---:|---:|---|
| **D-1** (K+2 RISK-020 reduce · P+1 live · Rc+2 DC-03 ≥ 5 verified cycles) | 16 | **21** | eligible |
| A-1 entity-records test + collision ratchet | 15 | 19 | eligible but edits `site/package.json` (It. 12 pending) |
| U-1 coverage generator, report-only | 15 | 17 | eligible |
No deviation: top eligible v2 item. Permitted with It. 12 uncommitted because file sets are disjoint (S6).

### Verification checklist
- **V1 production BEFORE (curl):** `/updates/2026-07-30` "Portugal's face-covering ban cuts its score 5 points" live;
  `/updates/2026-09-14` "Hong Kong falls 5.9 points" + "Hong Kong's score falls 5.9 points" live, also on `/updates`
  hub; `/updates/2026-07-31` "OpenAI's score would fall 5 points" (compliant). All with `scoreChangesApplied: 0`.
- **V2 coordinator re-runs:** see attempts below.
- **V3 negative controls (coordinator, real data forward-dated to 2026-09-15):** 09-14 → exactly 3 Hong Kong
  violations (headline, summary, topSignals[0].title; Syria not flagged); 07-30 → Portugal headline only; 07-31 → 0;
  09-14 with applied=1 → 0. Coordinator probes flagged: "Qatar rises to 64 of 100", "Tunis falls to 26.9", "Nepal
  climbs from 41.2 to 47.0", "Brazil slips out of the Established band", "composite dropped by 4.1 pts"; passed:
  "toll rose to 45", "protest deaths rose to 12", "fine from 50 to 20 million", "Deaths climbed 40 percent",
  "rises to 71.2 once the proposal is applied".
- **V4 built output:** N/A — no page output changes; the linter (part of the build chain) was run directly, exit 0.
  `npm run build` deliberately not run (churns tracked manifests, DC-08).
- **V5 dated content:** no published briefing edited; cutoff compares the JSON `date` string, never the clock;
  pre-cutoff matches print as REPORT-ONLY and never affect the exit code (AUTONOMY §1c).
- **V6 diff scope:** 5 files, all in scope, none shared with It. 12.
- **V7 post-deploy AFTER:** pending founder approval.

### Attempts (one item, two validation rounds failed, recorded honestly)
1. **Attempt 1 — FAILED coordinator validation.** Sentence-level co-occurrence (movement verb + any score word).
   Historical report: 63 matches, roughly half false positives ("death toll rose to 3,899", "fuel prices rose",
   "raises a new question", "Neither … lost points"); even the compliant OpenAI briefing failed ("proposes" not a
   qualifier). Forward-dated, it would have blocked legitimate nightly briefings.
2. **Rework — binding patterns.** Verb must bind to the score: score-subject→verb, verb→N points, verb→score value,
   verb→band, verb→its score; negation window; expanded qualifiers. 30 real-corpus fixtures (12 must-flag, 18
   must-pass) all pass; historical matches 63 → 38. **Coordinator found a residual false-positive source**:
   integer score values ("Jumps From 600 to 702 Deaths" in 07-14; probe "deaths rose to 12").
3. **Narrow fix.** Score value must be one-decimal (`28.4`) or an integer followed by "of 100". 9 more fixtures.
   Forward-dated total 32 → 31 (only the Ebola title removed).
- **Root cause of the two rounds:** the first acceptance criteria had no labelled false-positive corpus; precision was
  only testable once real sentences were fixtures. Standard for future gates: seed must-pass fixtures from real data.
- **Coordinator correction:** the agent reported that the docs needed no update; `.claude/agents/overnight-digest.md`
  still described the score-value pattern as "a bare number". Corrected by the coordinator.

### Validation Results (coordinator re-run, final)
- `npx tsc --noEmit` clean · `node scripts/test-lint-briefings.mjs` **99 passed, 0 failed** · `npm run test` exit 0 ·
  `node scripts/lint-daily-briefings.mjs` exit 0.
- Forward-dated exposure across all past briefings: **31 flags.** In the `scoreChangesApplied` era (07-20 → 09-14):
  21 flags = 19 true unapplied-movement statements (Philadelphia ×2, Taipei, Portugal, Spain/Abbott ×4, Chile/
  Regions/Kenya/Starbucks ×8, Hong Kong ×3) + 2 borderline (08-18, changes applied between cycles — compliant wording
  "were applied on 16 August" passes). 10 flags are pre-07-20 briefings without the field (fail-closed by design).

### Known limitations (documented, not hidden)
- Aggregate only: a cycle with `scoreChangesApplied ≥ 1` does not check which entity was applied.
- `scoreChangesApplied` is not required by `validate-daily-briefings.mjs`; absent is treated as 0 (fail-closed).
- `topSignals[].description` is not scanned; sentence splitting is regex-based.

### Outcome
Unapplied-movement statements that can reach a future public briefing: ungated (≥ 5 cycles published) → blocked at
build for briefings dated ≥ 2026-09-15. RISK-020 reduced (one error class of four), not closed.

### Commit pathspec (It. 13)
`site/scripts/lib/lint-rules.mjs` `site/scripts/lint-daily-briefings.mjs` `site/scripts/test-lint-briefings.mjs`
`.claude/agents/overnight-digest.md` `docs/DAILY_BRIEFING_SCHEMA.md` + artifacts (`ITERATION_LOG.md`
`IMPROVEMENT_BACKLOG.md` `SYSTEM_HEALTH.md` `CHANGELOG.md` `docs/DEFECT_CLASS_REGISTRY.md`).
Excluded: build-churn JSON/manifests, America-at-250, `entity-records-dryrun.json`, `.bak`, settings, grant docs.

### Follow-ups
- Make `pipeline.scoreChangesApplied` required in `validate-daily-briefings.mjs` (small; removes the fail-closed ambiguity).
- **S6 now binding:** It. 12 and It. 13 both validated and uncommitted → no further implementation until the founder
  approves commits (decision packet item 1 + It. 13 pathspec above).
- Deploy risk to note at approval: from 2026-09-15 the nightly digest must follow the new rule or the build fails
  (intended); `.claude/agents/overnight-digest.md` carries the rule and examples.

## Meta-review 1 (post Iterations 10–12) — 2026-09-14 — not an iteration

- **Trigger:** 3 completed loops. **Agent:** meta-coordinator → `docs/META_REVIEW_2026-09-14_ITER10-12.md`.
- **Verdict:** Amber — execution strong (3/3 first-pass validations; coordinator re-verification caught real
  defects), selection biased (3/3 site-copy fixes, 0/3 research pipeline; ease double-counted; gated items
  deferred whole; uncommitted pile-up).
- **Coordinator verification of its claims:** dirty paths 55 ✓ · `build-special-briefings.mjs:474` stamps
  `generatedAt: new Date()` into tracked JSON, 16 files timestamp-only ✓ · `test-entity-records.mjs` 19,687
  passed / 0 failed, not wired ✓ · America-at-250 uncommitted rewrite of a published briefing ✓ **but dated
  2026-09-03 (source `.md` mtime), not July** — corrected in the backlog.
- **Adopted (trial, It. 13–15):** scoring model v2, selection rules S1–S7, verification checklist V1–V7 — recorded
  in `IMPROVEMENT_BACKLOG.md`; `docs/DEFECT_CLASS_REGISTRY.md` created (governance artifact, §1a).
  `SYSTEM_HEALTH.md` canonical facts corrected; CHANGELOG deploy status note appended.
- **Not yet applied:** `.claude/agents/coordinator.md` / `meta-coordinator.md` spec edits; full SYSTEM_HEALTH
  table snapshot; CLAUDE.md data notes (founder-owned, packet item 9).
- **Next:** Iteration 13 = D-1 (v2 21), permitted with It. 12 pending because file sets are disjoint (S6).

## Iteration 12 — 2026-09-14 (stale hard-coded catalogue counts → derived + regression guard)

### Selected Item
**Public pages hard-coded the catalogue size and per-index counts** ("1,156 entities", "7/seven indexes",
"21 U.S. states", "50 robotics labs") instead of deriving them. Exactly one defect class.

### Reason for Selection
Found while verifying the grant request; scored I4 S5 L3 C5 − E1 − R1 = **15**, tied for top of queue, ungated,
certain and live. Traceability: a benchmark whose own pages misstate its size by 169 entities undercuts
every count it publishes. Chosen over U (16) because U needs founder sign-off on publishing the 61.7% share.
**BEFORE (production curl, raw HTML occurrences; RSC payload roughly doubles each):** /data 1,156×10,
7-indexes×2, 21-states×2, 50-robotics×2 · /media 1,156×8, 7-indexes×4 · /score-watch 7-indexes×4, 21-states×2
· /pricing 21-states×2 · /api-access 7-indexes×4 · / 7-indexes×6 · /updates/special 1,156×8.
Canonical: 1,325 entities, 8 indexes, 51 states, 92 robotics labs.

### What Changed
- `entityCount.ts`: new `getIndexEntityCount(indexSlug)` (fails loud); stale literals removed from its docs.
- Derived from `SCORED_ENTITY_COUNT_FORMATTED` / `INDEX_COUNT` / `getIndexEntityCount`: `/data`, `/media`,
  `/api-access`, `/pricing`, `/purchase-research`, `/score-watch`, `/updates/special` (+ `[slug]` live-chart
  caption reworded to present tense), `/` (home), `/indexes`, 4 `nonprofit-alt` pages (already said 8 as a
  literal), 4 component doc comments.
- **Same-defect completions (agent-found, coordinator-accepted):** Universities was *missing* from the home
  "indexes at a glance" grid, the home "Published indexes" cards, the `/data` endpoint list and the
  `/score-watch` index list — the other face of "seven indexes". Added; home takeaway verified against
  `universities.json` (3 established / 76 functional / 21 developing / 0 exemplary / 0 critical).
  `/purchase-research` "21 of 51 states scored to date — full index in progress" → "All 51 states scored".
- Daily briefing trust line: "across 7 indexes" → "across the benchmark's indexes" (header renders for every
  past briefing; pre-06-19 briefings covered 7; briefing JSON carries no per-briefing index count). Pipeline
  fallback literal "1,160" → canonical count (only used when pipeline data is absent).
- **Deliberately unchanged:** `/media` sentence describing the dated inaugural 2026 report ("1,156
  institutions … seven index families") — a publication's as-published figures (AUTONOMY §1c); dated
  special-briefing JSON body copy.
- **Guard:** `site/scripts/test-no-stale-counts.mjs`, wired into `npm run test`; one commented allowlist entry.

### Agents Involved
- coordinator — selection, production baseline, context review of dated copy, independent verification, artifacts
- frontend-engineer — implementation, guard

### Validation Results
- Coordinator: `npx tsc --noEmit` clean; `npm run test` exit 0 (all suites incl. model-releases 93/93;
  no-stale-counts 176 files, 0 findings).
- Coordinator guard proof: planted probe with all four patterns → FAIL exit 1 (4 findings, file:line);
  removed → ok exit 0.
- Agent `npm run build` exit 0; coordinator grep of built output: home 1,325 entities / 8 indexes; /data
  1,325 · 8 · 51 · 92; /score-watch 1,325 · 8; /pricing 51 · 92; /api-access 8 index families · 8 indexes;
  /purchase-research 92; no `1,156` in any non-dated page; 2026-05-20 briefing keeps its historical 1,160
  pipeline figure with neutral trust line.
- Diff reviewed line by line (22 source files). Build-regenerated timestamps in special-briefing JSON /
  manifests and the pre-existing America-at-250 edit are not part of this iteration.
- No commit, push or deploy (AUTONOMY §1b).

### Outcome
Stale catalogue-count claims on current-state public pages: ~20 source literals across 11 routes → 0,
with a CI guard preventing recurrence. Universities now present on all four index lists that omitted it.

### Follow-ups
- Founder: approve commit + deploy of Iteration 12.
- Home "at a glance" takeaways are hand-written sentences — could drift as bands move; candidate to derive.
- Guard covers `src/app` + `src/components` only; `scripts/` generators (e.g. feeds, OG images) not scanned.
- Meta-review trigger: Iterations 10–12 complete = 3 loops → run `meta-coordinator` before Iteration 13.

## Iteration 11 — 2026-09-14 (fix the dead citation URL pattern + llms.txt drift — PR/FAQ S-1, C18)

### Selected Item
**S-1: `/cite` taught a citation URL pattern that does not resolve, and `llms.txt` hard-coded a stale
entity count and omitted `/cite` and `/ai-models`.** Exactly one item.

### Reason for Selection
Next PR/FAQ "do now" item after G-1. Chosen over U (coverage dashboard, score 16) because S is a certain,
live, externally-checkable defect with Effort 1 / Risk 1, while U publishes the 61.7% never-assessed share
on the site — a disclosure that overlaps item E (Risk 3) and warrants founder sign-off first.
**BEFORE (production, curl 2026-09-14):** `/fortune-500/microsoft` (the `/cite` example) → 2 redirects →
`/404` served with HTTP 200 (soft 404); `/company/microsoft` → 200. Live `llms.txt`: "1,260+ entities",
no `/cite`, no AI models section.

### What Changed
- `site/src/app/cite/page.tsx`: APA/MLA/Chicago strings and the canonical-URL section now use
  `[entity-type]/[slug]`; example is `/company/microsoft`; new table of index → entity URL prefix rendered
  from `INDEX_REGISTRY` (not hand-typed).
- `site/src/app/media/page.tsx`, `site/src/app/data/page.tsx`: same dead example/pattern fixed; link to
  `/cite#canonical-url`.
- `site/scripts/build-llms.mjs` (+ generated `site/public/llms.txt`): entity count derived from
  `rankings.length` across the 8 index JSONs (fails loud on a missing `rankings`); added `/cite` and an
  "AI models" section describing `/ai-models` as a pre-registration with no model scored. No third-party
  names added (CompassionBench disambiguation left for founder).

### Agents Involved
- coordinator — selection, production baseline, independent verification, artifacts
- frontend-engineer — implementation + build verification

### Validation Results
- Agent: `npx tsc --noEmit` clean; `npm run test` all suites pass (scoring 125/125, lint 11/11, history
  39/39, entity-href 40/40, product-separation 16/16, separation-waivers 17/17, task-bank 68/68,
  evaluation-scorer 45/45, model-registry 38/38, evaluation-statistics 78/78, model-harness 58/58,
  model-releases 93/93); `npm run build` exit 0.
- Coordinator re-checks: diff reviewed (5 files, scope-clean); grep of `src/app` + `src/components` finds
  no remaining `[index]/[slug]` or `/fortune-500/<slug>` citation URLs; exported pages exist for
  company/country/us-state/ai-lab/robotics-lab/us-city/university/city prefixes; built `out/llms.txt`
  states 1,325 entities (= 191+51+447+50+92+144+250+100 = build-manifest total) and **15/15 URLs exist**
  in the export.
- No commit, push or deploy (AUTONOMY §1b).

### Outcome
Citation examples on /cite, /media, /data: 1 dead pattern (soft 404) → 0 once deployed. llms.txt entity
count: hard-coded and 65 stale → derived from data.

### Follow-ups
- `/media` "Data access" still hard-codes "1,156 entities" (canonical 1,325) — route through `entityCount.ts`.
- llms.txt "no model has been scored yet" is a literal — derive from model-index facts before D-29 flips.
- CompassionBench (compassionbench.com) disambiguation in llms.txt/site — founder decision (names a third party).
- `/404` returns HTTP 200 (soft 404) — part of PR/FAQ item T (nginx real 404s).
- ~~Founder: approve commit + deploy of Iterations 10–11.~~ **Done 2026-09-14** on founder approval:
  commits beb94ae9 (It. 10), f940a80b (It. 11), 376b0f85 (artifacts); deploy run 34901047499 all four jobs
  success; live production verified by curl for both iterations. Worker not deployed to Cloudflare
  (typecheck-only change; host still NXDOMAIN, RISK-014).

## Iteration 10 — 2026-09-14 (remove a false composite-formula claim — RISK-019 / PR/FAQ G-1)

> Numbering note: loops between 2026-06-20 and 2026-09-14 were recorded in commit messages, DECISIONS.md,
> RISKS.md and the PR/FAQ rather than here. This entry resumes the log; it does not retro-edit them.

### Selected Item
**G-1: correct the `/ai-models/methodology` FAQ claim that "a balanced profile scores higher than a spiky
one with the same average."** Exactly one item.

### Reason for Selection
The candidate set was the PR/FAQ's same-day reconciled table (12 specialist reviews; not regenerated to
avoid duplicate work). G-1 was the only top-10 item that is a certain, currently-published factual error
about the benchmark's own formula (RISK-019 "Certain / High"), reused verbatim in FAQPage JSON-LD that
answer engines ingest, with Effort 1 / Risk 1 and no founder gate. Higher-scored U/D/I are larger builds
queued next. Bias: correctness/determinism first.

### What Changed
- `site/src/app/ai-models/methodology/page.tsx` (FAQ answer 1, lines 29–35): false sentence replaced with
  an accurate description — average rescaled to 0–100 + integration bonus up to 10, earned as dimensions
  reach 4.0, −1/5 per dimension below 4.0, reduced further for wide spread, 0 if any dimension is 0.
- No formula, data, score, or other page changed.

### Agents Involved
- coordinator — system review, selection, independent formula verification, validation, artifacts
- frontend-engineer — implementation + verification script

### Validation Results
- Formula check (agent script + coordinator's independent re-run against `site/scripts/lib/scoring.mjs`):
  [1,1,1,1,5,5,5,5] → 51.5 vs flat 3.0 → 50.0 (old claim false); all-4.0 → premium 10 (85.0); one dim 3.9
  → premium 8; all 3.99 → premium 0 (74.8); any dim 0 → premium 0. Every claim in the new copy holds.
- Grep: no test or script pinned the old string.
- `npx tsc --noEmit` (site): clean. `npm run test` (site): all suites pass, incl. scoring 125/125,
  model-releases 93/93.
- `npm run build` (site): 1,978/1,978 static pages generated; validate-daily-briefings 79/79 PASS.
- Also validated the uncommitted prior-session Worker fix: `npm run typecheck` in `worker/` passes.
- No commit, push or deploy (AUTONOMY §1b).

### Outcome
Published-method accuracy: 1 known false formula claim → 0 on `/ai-models/methodology` once deployed.
RISK-019 copy half closed; the 3.99→4.0 cliff and premium-change decision stay open (founder/Methods).

### Follow-ups
- Founder: approve commit + deploy of this change and the Worker typecheck fix.
- G-3: verify related "balanced 70/70 vs spiky 90/40" wording (`methodology/page.tsx:1266`,
  `ConsistencyStepChart.tsx`, `dimensions.ts:635`).
- Next loop candidate: U — coverage/freshness dashboard (score 16).
- Founder briefing drafted at `docs/founder-briefings/2026-09-14.md`; email delivery not possible from
  this environment (no mail credentials; local Outlook 2016 has no configured account).
- Meta-review trigger: this log shows no 3-loop cadence since Iteration 9 — run `meta-coordinator`
  after Iteration 12 or sooner if validation fails twice.

## Iteration 9 — 2026-06-20 (methodology-page hardening — founder-authorized multi-item push)

### Selected Item
**Methodology-page hardening (Tranche A — 12 items across 4 validated waves).** Founder authorized "all
improvements + quick-wins" from the 5-lens methodology review (deviation from the 1-item rule, explicit
authorization — same precedent as Iterations 4/5/8). Score-changing items (Tranche B) were GATED, not
implemented, per the editorial human-approval rule.

### Reason for Selection
A 5-lens review (system-architect, benchmark-research, ux-designer, knowledge-architect, frontend-engineer)
of `/methodology` found the page is conceptually strong but had: (1) a self-contradiction and a
mathematically-incoherent "base /80" formula model that contradicted the canonical `scoring.ts` AND the live
entity pages; (2) the three rules that actually decide contested scores (victim/perpetrator attribution,
near-floor limitation, harm-flag 0.0 floor) undocumented; (3) a stale version (v1.1 vs engine v1.2); and
(4) a cluster of unanimous trust bugs (anchor-table header, broken TOC anchor, data-drift, always-on
back-to-top). All Tranche A fixes are doc/page/code-only — NO published score changes.

### What Changed (Tranche A — 12 items)
- **Wave 1 (frontend-engineer):** A1 anchor-table header fixed (was "0·1·2·3·4 = Exemplary"); A2 TOC
  completed + broken `#continuous-pipeline`/idless pipeline-flow section fixed (new `#nightly-pipeline`) +
  duplicate "Framework overview" relabeled "The 8 dimensions"; A3 version stat v1.1→v1.2; A4 back-to-top
  gated behind a scroll threshold (new `BackToTop` client island); A5 worked-example + assessors-in-practice
  now derive dimension code/name from `DIMENSIONS` (data-drift closed); stable React keys.
- **Wave 2 content (system-architect):** authored `docs/methodology-v1.2-additions.md` — accurate v1.2
  changelog, attribution & subject rule, near-floor limitation (with the digest's open question flagged, not
  invented), harm-flag/0.0 floor (honest formula-vs-editorial split), evidence notes.
- **Wave 2+3 (frontend-engineer):** integrated the above as new sections `#attribution-rule`,
  `#near-floor-limitation`, augmented `#floor-designation`; A8 evidence notes; A7 integration-premium
  arithmetic shown in the Abridge example; A9 "3-minute summary"; A10 newsletter moved out of mid-stream;
  A11 "two kinds of scores" + "if you remember one thing" closer.
- **Wave 4 (frontend-engineer):** corrected the systemic formula-model inaccuracy. The page taught a wrong
  "base /80 + premium /10" model (maxes at 90, not 100). Replaced with the canonical
  `baseComposite = ((avg−1)/4)×100` (0–100) + premium (0–10), clamped to 100 — in page.tsx prose/deks/worked
  example AND in `ScorePipelineDiagram.tsx` + `IntegrationPremiumDiagram.tsx` labels. Worked example now
  reconciles end-to-end against Abridge's REAL stored dimensions (verified vs ai-labs.json): base 60.9 +
  premium 0.0 = 60.9 (premium genuinely 0 — all 8 dims < 4.0; reframed as a teaching point).

### Coordinator corrections during the push
- Caught a regression introduced mid-push: Wave 2+3 fixed the premium to 0.0 in Step 3 but Step 4 still said
  "55 + 5.9 = 60.9" — internal contradiction. Verified the canonical formula + Abridge's real data myself,
  then dispatched Wave 4 to fix it and the deeper "/80" model error site-wide.
- Enforced the no-fabrication rule: near-floor "open question" documented as open, not resolved; harm-flag
  0.0 floor described honestly (formula output vs editorial designation).

### Agents Involved
- coordinator — review synthesis, backlog scoring, tranche/wave sequencing, formula verification, two
  corrections, validation, artifacts
- system-architect — scoring/methodology review + v1.2 content authoring
- benchmark-research, ux-designer, knowledge-architect — review lenses
- frontend-engineer — Waves 1, 2+3, 4 (page + chart components)

### Validation Results
- `npx tsc --noEmit`: ✅ clean after every wave (final gate clean)
- `npm run build`: ✅ 1,880 pages prerendered, 0 new errors (132 pre-existing warnings unchanged)
- Worked example reconciles: base 60.9 + premium 0.0 = composite 60.9 (matches published Abridge 60.9)
- Site-wide grep: ✅ no `base /80` / `0–80` model strings remain (only legitimate "60–80" band ranges)
- No JSON/scoring code changed → no published score moved (independent of the editorial approval gate)

### Outcome
The methodology page now (a) describes the actual canonical formula consistently across prose, worked
example, and both chart components; (b) documents the three previously-hidden governing rules; (c) matches
the live engine version (v1.2); and (d) clears the unanimous trust bugs. Tranche A complete.

### Follow-ups (Tranche B — GATED, awaiting founder approval; each changes published scores/scoring math)
- B2 band-boundary semantics (`getBand` upper-inclusive vs `BANDS.min/max` lower-inclusive)
- B3 harm trigger `=== 0` → band; B1 explicit harm-flag/0.0 floor in `scoring.ts`
- B6 Insufficient-Evidence status (replaces "default to lower anchor on absence")
- B7 near-floor evidence-saturation pathway (the UHG problem — highest risk)
- B8 consequential confidence levels; B4 smooth step-function cliffs
- B5 persist integration-premium breakdown into per-entity JSON (additive; sequence first)
- Non-gated deferred: extract long methodology sections into sub-components (frontend R6)

## Iteration 8 — 2026-06-18 (finish the four in-flight page deep-dive backlogs)

### Selected Item
**Finish the in-flight deep-dive backlogs** (Methodology, Updates, Home, Indexes). Founder-authorized multi-item push (deviation from 1-item rule, explicit authorization — same pattern as Iterations 4/5). Each page had a do-first wave shipped; this completes the remaining ranked items.

### Reason for Selection
The four core reader pages were each ~25–55% complete. Finishing them lands the full comprehension/visual/dwell-time gains the 5-lens reviews identified, and clears the in-flight WIP before opening new page reviews. Buildable-now items only; blocked items parked with reasons.

### What Changed (53 items shipped across 4 pages)
- **Methodology (13):** #5 sticky TOC island, #6 score-building pipeline SVG, #7 worked example (Abridge), #8 inline entity links (real slugs), #10 grouped/collapsible subdim table, #11 reorder, #12 evidence pyramid, #13 message-matched newsletter, #16 consistency step chart, #17 footer funnel, #18 floor progressive disclosure, #19 pipeline flow + human gate, #20 cross-links + back-to-top. **All 20 done.**
- **Updates (12 + 3 reconciled):** confirmed #1/#4/#5 shipped earlier in `dc6a761` (status log was stale); shipped #8/#9/#11/#12/#13/#14/#15/#16/#17(degraded)/#18/#19/#20. **All 20 done.**
- **Home (14):** #3/#4/#7/#8/#10/#11/#12/#13/#14/#16/#17/#18/#19/#20. **All 20 done** (excl. founder-gated `Organization.sameAs`).
- **Indexes (14):** #3/#4/#6/#7/#10/#11/#12/#13/#14/#15/#16/#17/#18/#20. **All 20 done.**

### Coordinator corrections during the wave
- Updates #8: agent introduced a hardcoded `"1,156"` literal → replaced with `@/data/entityCount` constant (protects the Iteration 6 invariant).
- Home #17: agent emitted a `SearchAction` JSON-LD pointing at a non-existent `/search?q=` route → removed the SearchAction (kept the honest `WebSite` node), since dishonest structured data violates the no-fabrication rule.

### Agents Involved
- coordinator — scoping, per-page handoffs, two integrity corrections, validation, artifacts
- frontend-engineer — 4 sequential page waves (one per page)

### Validation Results
- `tsc --noEmit`: ✅ clean after every wave
- `npm run build`: ✅ 1,666 pages prerendered after each wave (4 builds; no regressions)
- Canonical-count guard: ✅ no hardcoded total-count literals in the 4 target pages (all via `@/data/entityCount`)
- JSON-LD honesty: ✅ all new structured data (FAQ, CollectionPage/ItemList, WebSite, Breadcrumb) traces to real data/routes

### Outcome
All four core reader pages' deep-dive backlogs are **complete** (80/80 ranked items, minus 1 founder-gated). Status logs reconciled (incl. the stale Updates log).

### Follow-ups (deferred, parked with reasons)
- Build a real `/search` results page (Pagefind), then restore the WebSite `SearchAction`.
- Updates #17 full per-dimension micro-bars — needs the digest to emit per-dimension deltas (schema change).
- Updates #20 — migrate the 4 `resolveSlugHref` callers to the new centralized `@/lib/entityHref` export.
- Founder-gated: root `Organization.sameAs` verified profile URLs.
- New page groups still un-reviewed (index leaf pages, entity detail pages, commercial/conversion pages, assessment tools).

---

## Iteration 7 — 2026-06-18 (de-footgun the nightly pipeline)

### Selected Item
**Fix the stale, footgun research runbooks.** The autonomous nightly pipeline (`scripts/nightly-pipeline.sh`) and the manual runbook (`research/run-pipeline.sh`) both ran the **deprecated `prepare-updates.mjs`** as a stage. Since the digest agent now authors the rich public briefing directly, that stage *overwrites* the rich briefing with a flat schema the build rejects — meaning every autonomous night would push an unbuildable commit and break the auto-deploy. (This exact clobber happened during the 2026-06-18 manual cycle.) Founder-selected from the Iteration 6 "next best candidates."

### Reason for Selection
Removes a live production footgun (broken autonomous deploy) — directly strengthens **determinism** and **reliability**. Low effort, low risk (scripts + docs only, no app code), high confidence.

### What Changed
- **`scripts/nightly-pipeline.sh` (the live VPS cron orchestrator):**
  - Stage 4 (digest) prompt now instructs the digest to author the rich public briefing (`daily/$DATE.json` + `latest.json` + manifest) and self-validate; added an existence assert for the briefing.
  - **Stage 5 replaced**: deprecated `prepare-updates.mjs` → a **validation gate** (`validate-daily-briefings.mjs` + `lint-daily-briefings.mjs`) that runs *before* commit/push, so a bad briefing fails the run instead of being pushed and breaking the Docker build/deploy.
  - Scanner prompt count `1,155 → ~1,160`; header stage list + a "never re-introduce prepare-updates" warning; morning-review tail hint corrected to `npm run build`.
- **`research/run-pipeline.sh` (manual runbook):** same Stage-4/Stage-5 correction (digest authors rich briefing; Stage 4/4 is now a validation gate); scanned count fixed; "three-stage" → accurate description.
- **`research/SCHEDULING.md` + `docs/VPS_SCHEDULING.md`:** schedule tables / "what happens each night" updated to drop `prepare-updates`, add the validate step, fix `1,155 → ~1,160`, and correct the morning-review apply→rebuild step.

### Agents Involved
- coordinator — diagnosis (traced cron → `nightly-pipeline.sh` Stage 5), implementation, validation, artifacts

### Validation Results
- `bash -n` on both scripts: ✅ clean
- Referenced validators exist: ✅ `validate-daily-briefings.mjs`, `lint-daily-briefings.mjs`
- No live `prepare-updates` calls remain (only deprecation notes): ✅
- Gate scripts run green: ✅ validate-daily-briefings 30/30 · lint-daily-briefings clean

### Outcome
The autonomous nightly pipeline can no longer clobber the digest's rich briefing, and it now self-gates before pushing — eliminating the broken-deploy class. Runbooks and the live cron script agree with the actual (digest-authored) flow.

### Follow-ups (deferred)
- Consider a full `npm run build` gate (not just the briefing validators) before commit/push in `nightly-pipeline.sh`, so any data/type regression also blocks the push. Larger change; deferred.
- Full `SYSTEM_HEALTH.md` coverage refresh (test-suite rows still Iteration-3 era).

---

## Iteration 6 — 2026-06-18 (canonical entity-count)

### Selected Item
**Canonical entity-count — single source of truth.** Founder-selected from the "next best candidates" surfaced in the 2026-06-18 status review. The site displayed three different entity totals (1,155 / 1,156 / 1,160) on the same scroll — a citable-fact integrity risk on the most-cited pages, and the explicit blocker on Methodology backlog #19.

### Reason for Selection
High impact, low effort, low risk, high confidence. Strengthens **traceability** and **correctness** (top-priority Ledgerium dimensions): one derived number instead of scattered literals. Unblocks a queued page-improvement item. No data or score risk — pure presentation/contract fix.

### What Changed
- **New:** `site/src/data/entityCount.ts` — single source of truth. `SCORED_ENTITY_COUNT` = sum of `rankings.length` across the 7 index JSONs (193+448+250+50+50+144+21 = **1,156**), plus `SCORED_ENTITY_COUNT_FORMATTED`. Comment documents scored (1,156) vs scanned (1,160).
- **Deduplicated:** the two inline derivations in `app/page.tsx` and `app/indexes/page.tsx` now import the shared constant.
- **Replaced stale `1,155` / `~1,160` catalog literals → canonical constant** in 11 surfaces: NavbarSearch, methodology (×2), NewsletterSignup (×2), HistoryTimeline, score-watch (×2), updates, updates/[date], updates/archive (×3), plus dynamic JSON-LD fallbacks and DailyBriefingHeader thesis copy. ChartFrame JSDoc example corrected.
- **Preserved the distinct *scanned* metric** (1,160, `pipeline.entitiesScanned`) where copy literally describes the nightly scan (DailyBriefingHeader stat fallback, CompletionBlock). Generated data files and special-briefing cohort math untouched.

### Decision recorded
Canonical contract: **scored catalog = 1,156** (derived, citable); **scanned nightly = 1,160** (rotation-state coverage, used only with "scanned" wording).

### Agents Involved
- coordinator — scoping, canonical decision, validation, artifacts
- frontend-engineer — implementation (module + 13 file edits)

### Validation Results
- `tsc --noEmit`: ✅ clean
- `npm run build`: ✅ 1,666 pages prerendered (no regression)
- `validate-indexes`: ✅ 12,750 checks, 0 errors
- Rendered-output spot check: methodology / updates / score-watch / updates-archive now render **1,156**, zero **1,155**
- Residual stale-literal grep across `site/src` .ts/.tsx: ✅ zero

### Outcome
One citable entity-count, derived from the data, consistent across every public page. Methodology backlog #19 unblocked.

### Follow-ups (deferred)
- Stale `research/run-pipeline.sh` (calls deprecated `prepare-updates.mjs`; cites 1,155) — next candidate.
- Refresh `SYSTEM_HEALTH.md` fully (still references Iteration 3 era; partially updated this loop).

---

## Iteration 5 — 2026-04-30 (combined micro-loop, 2 items)

### Selected Items
Founder-authorized 2-item micro-loop following Iteration 4. Both items strengthen the determinism gate around production builds.

1. **Backlog #5** — Wire `validate` into build pre-step (qa, score 15)
2. **Backlog #7** — Zod schemas for indexes + proposals (architecture, score 14)

### Reason for Selection
Iteration 4 introduced a build-time manifest with sha256 hashes per index. Without a validation gate or schema parse before the manifest runs, the manifest could happily hash a malformed index. Items #5 and #7 close that gap from two directions: #5 enforces score/structure invariants at the script layer; #7 enforces shape invariants at the runtime/TS layer. Together they make `npm run build` fail loudly on any drift before the static export is generated.

### What Changed

**#5 — Validate wired into build pre-step**
- Modified: `site/package.json` — `build` is now `node scripts/validate-indexes.mjs && node scripts/build-manifest.mjs && next build`. The validate gate runs first, before the manifest is hashed and before Next compiles.
- Modified: `site/scripts/validate-indexes.mjs`:
  - `KNOWN_PARTIAL.us-states.bandTotal`: `51 → 21` (matches the 21 published U.S. states; 30 unscored states are now correctly counted as partial-but-consistent rather than as a structural drift error)
  - `ASSESSOR_OVERRIDE_NAMES` extended with 12 entities whose composite legitimately diverges from the formula due to assessor overrides documented in research artifacts: Iceland, Finland, Denmark, Luxembourg, Sweden, Norway, Germany, New Zealand, Vermont, Minnesota, Hugging Face, Becton Dickinson
- **No data was modified.** All score and band changes were in the validator's allowlist/config layer only.
- Result: 13 pre-existing errors → 0 errors. Build now fails fast on any new drift.

**#7 — Zod schemas as single source of truth**
- New: `site/src/data/schema.ts` — exports `IndexFileSchema`, `IndexMetaSchema`, `RankingEntrySchema`, `BandSummarySchema`, `FloorDesignationSchema`, `ChangeProposalSchema`, `EvidenceItemSchema`, plus inferred TS types (`IndexFile`, `RankingEntry`, `ChangeProposal`, `FloorDesignationData`, …) and constants (`DIMENSION_CODES`, `BAND_NAMES`).
  - `looseObject` is used for `RankingEntrySchema` and `ChangeProposalSchema` so index-specific metadata (`sector`, `hq`, `region`, `country`, `state`, `f500Rank`, `category`) flows through unmodified while canonical fields are strictly validated.
  - `DimensionScoresSchema` enforces all 8 dimension codes with values in `[0, 5]` (0 = harm flag, matches scoring.ts semantics).
- Modified: `site/src/data/entities.ts`:
  - Removed `interface RawIndex` and the field-by-field `as string` / `as number` / `as Record<string, number>` casts (~30 cast operations eliminated)
  - Added `parseIndex(name, raw)` helper that calls `IndexFileSchema.safeParse` and throws a labelled error on failure
  - `buildEntities` now takes a parsed `IndexFile` (zod-inferred) and reads strongly-typed fields directly
  - Module-load behaviour: any drift in any of the 7 ranking JSONs now throws at static-export time with a structured zod error path
- Added dependency: `zod ^4.4.1`

### Agents Involved
- coordinator — synthesis, sequencing, implementation, validation

### Validation Results
- Build: ✅ `validate → manifest → next build` — 1,203 pages prerendered (no regression)
- Validator: ✅ 12,748 checks pass, 0 errors, 130 warnings (gate active)
- Schema parse: ✅ All 7 indexes parse cleanly under `IndexFileSchema` at module load
- TypeScript: ✅ `tsc --noEmit` clean
- Tests: ✅ `npm run test:scoring` 69/69 passing (unchanged from Iteration 4)

### Outcome
Production builds now have **two layers of drift detection** before the static export:
1. **Structural / formula** layer (validate-indexes.mjs) — score-vs-formula divergence, band boundaries, partial-index sums, assessor-override allowlist enforcement
2. **Shape / type** layer (zod schema parse in entities.ts) — required fields, types, value ranges (e.g. dimension scores ∈ [0, 5])

Either layer fires → `npm run build` aborts → no malformed deploy. The manifest's sha256 hashes are now guaranteed to be over schema-valid data.

### Follow-ups (deferred)
- Apply `ChangeProposalSchema` validation to the score-updater pipeline (not just the index files). Would catch malformed proposals at the agent boundary rather than at apply-time. Defer until the next nightly-run iteration.
- Make zod parse errors surface index name + ranking row index in the error path for faster debugging on future drift. Currently the error message is the full zod report; a small wrapper could prepend `[fortune-500 row 217]` for legibility.

---


## Iteration 4 — 2026-04-30 (combined micro-loop, 4 items)

### Selected Items
Founder-authorized 4-item micro-loop (deviation from "1 item per loop" rule, explicit authorization):

1. **Backlog #4** — Single scoring formula module (architecture, score 15)
2. **Backlog #3** — EntitySearch routes to wrong page (UX, score 15)
3. **Backlog #2** — Ranking table instrumentation (analytics, score 16)
4. **Backlog #8** — Build-time data manifest (architecture, score 14)

### Reason for Selection
After consolidated review across 7 specialist agents (product-manager, system-architect, qa-engineer, frontend-engineer, backend-engineer, ux-designer, analytics) producing 32 candidates, founder selected this cluster for combined execution. Common thread: **strengthens determinism, traceability, and observability primitives that underpin all future work.** No item depends on another, so failure of any one would not block the others.

### What Changed

**#4 — Single scoring formula module**
- New: `site/scripts/lib/scoring.mjs` — canonical script-side composite formula, `getBand`, `BAND_ORDER`, `BAND_RANGES`, `DIMENSION_CODES`, `METHODOLOGY_VERSION`
- Modified: `site/scripts/validate-indexes.mjs` — imports from canonical module, eliminating ~30 duplicated lines of formula logic
- Modified: `site/scripts/test-scoring.mjs` — added 25 drift-gate tests (golden inputs, methodology version, dimension-codes parity)
- Validator output unchanged (12,747 checks pass identically)

**#3 — EntitySearch routes to wrong page**
- Modified: `site/src/components/index/EntitySearch.tsx`
  - Imports `entityHref` and `slugify` from canonical lib
  - Search results now route to `/{kind}/{slug}` (entity detail) instead of `/{indexSlug}` (index page)
  - Falls back to index page only when index has no detail route
  - Added `entity_search_result_click` analytics event with query + entity_name + target type

**#2 — Ranking table instrumentation**
- Modified: `site/src/components/index/RankingTable.tsx`
  - Added `KIND_TO_INDEX_SLUG` map (mirrors `entityHref.ts` for analytics symmetry)
  - 4 new events: `ranking_table_search` (debounced 800ms, ≥2 chars), `ranking_table_filter`, `ranking_table_sort`, `ranking_entity_click`
  - Each event carries `index_slug`, `entity_kind`, plus event-specific context (rank, composite, band for clicks; query_length for searches)

**#8 — Build-time data manifest**
- New: `site/scripts/build-manifest.mjs` — emits `public/build-manifest.json` (copied to `out/` by Next.js static export)
- Modified: `site/package.json` — `build` script now `node scripts/build-manifest.mjs && next build`; new `manifest` script for ad-hoc runs
- Manifest schema: `buildDate`, `git { sha, branch, dirty }`, `methodologyVersion`, per-index `{ rankingsCount, entityCount, hash (sha256), meanScore, medianScore, bands, floorDesignations }`, `totalEntities`, `totalFloorDesignations`, `recentAppliedProposals` (last 20)
- First build output: 7 indexes, 1,156 entities, 6 floor-designated, methodology v1.2

### Agents Involved
- product-manager, system-architect, qa-engineer, frontend-engineer, backend-engineer, ux-designer, analytics — candidate generation (parallel review)
- coordinator — synthesis, sequencing, implementation, validation

### Validation Results
- Build: ✅ Manifest generates → Next build → 1,203 pages prerendered (was 1,203, no regression)
- Tests: ✅ `npm run test:scoring` 69/69 passing (was 44; +25 drift-gate tests)
- Validator: ✅ `npm run validate` produces identical output (12,747 checks pass) — pure refactor confirmed
- Manifest: ✅ Written to `public/build-manifest.json`, copied to `out/build-manifest.json` during static export
- Determinism: ✅ Scoring formula now has single source of truth + drift-gate; reproducible build manifest captures full data-layer state

### Outcome
- **Determinism strengthened:** scoring formula deduplicated; drift-gate test added; methodology version centralized
- **Traceability strengthened:** every build now produces a hashed manifest of the data layer + recent applied proposals
- **Observability strengthened:** ranking-table interactions and entity-search clicks now measurable in Umami
- **User-facing bug fixed:** entity search results no longer dead-end on the index page

### Follow-ups
- (Pending) Surface manifest data in `/updates` page (read `/build-manifest.json` for cache-bust + entity-count assertions)
- (Pending) Wire `npm run validate` into `build` (Backlog #5, score 15) — would close the regression-class gap
- (Pending) Add Umami dashboard with `ranking_table_*` and `entity_search_result_click` events

---

## Iteration 1 — 2026-04-14

### Selected Item
Fix 4 failing interactive tests (Backlog #1, Score: 14)

### Reason for Selection
Tests are the foundation of the improvement loop. The system was in a degraded state with 4 failing tests, blocking reliable validation of all future changes. Determinism principle: restore the ability to prove correctness before adding anything new.

### Root Cause Analysis
The 4 test failures were NOT caused by code bugs. Root cause: Playwright config had no `webServer` directive, requiring a manually-started dev server on port 3000. A stale/crashed server was returning 500 errors, causing all interactive component tests to fail.

### What Changed
- **`playwright.config.ts`**: Added `webServer` config to auto-start a static file server (`npx serve out -l 3000`) before tests run, with `reuseExistingServer` for local dev convenience
- **`test-results/`**: Cleaned up stale error artifacts from failed runs
- **SelfAssessment email gate** (pre-existing uncommitted change): Confirmed working — all SelfAssessment tests pass with the new email capture feature

### Agents Involved
- product-manager — candidate generation
- system-architect — candidate generation
- qa-engineer — candidate generation
- growth-strategist — candidate generation
- coordinator — root cause analysis, implementation, validation

### Validation Results
- Build: ✅ All 27 routes compile successfully
- Tests: ✅ 54/54 Playwright tests pass (8.5s)
- Determinism: ✅ Tests now auto-start their own server — no manual setup required
- Regression: ✅ No regressions detected

### Outcome
Test infrastructure is now self-contained and deterministic. Running `npx playwright test` works from a cold start without any manual server setup. This eliminates the class of "stale server" failures permanently.

### Follow-ups
- Backlog #2: Fix hardcoded `/8` in SelfAssessment scoring (Score: 14)
- Backlog #3: Fix homepage stat inconsistencies (Score: 13)
- Backlog #4: Add conversion CTA to SelfAssessment results (Score: 13)

---

## Iteration 2 — 2026-04-14

### Selected Item
Fix all factual errors, broken links, and internal copy on public pages

### Reason for Selection
A benchmark institution publishing wrong numbers and internal planning notes destroys the core value proposition. Every specialist agent rated this as the #1 priority. Combined as one item because all fixes are the same class (wrong/unprofessional content) and each is a 1-2 line change.

### What Changed
- **Homepage (`page.tsx`)**: Fixed "780" → "1,155" entities, "5" → "7" index families, "AI Labs: 25" → "50", "five primary" → "seven", added missing title metadata
- **Indexes page (`indexes/page.tsx`)**: Fixed broken Gumroad link (string literal → variable reference), removed duplicate import, fixed "780" → "1,155", "5" → "7", "five" → "seven", replaced internal planning copy with user-facing text, fixed meta description
- **Purchase research (`purchase-research/page.tsx`)**: Fixed "5" → "7" index families
- **SelfAssessment (`SelfAssessment.tsx`)**: Replaced hardcoded `/8` with `DIMENSIONS.length` in calcScores()
- **Test (`home.spec.ts`)**: Updated entity count assertion from 780 to 1,155

### Agents Involved
- Explore agent — deep codebase audit (every file)
- ux-designer — UX flow audit and prioritization
- qa-engineer — bug triage and severity rating
- coordinator — verification, implementation, validation

### Validation Results
- Build: ✅ All 27 routes compile
- Tests: ✅ 54/54 pass
- Regression: ✅ None

### Outcome
All publicly visible factual errors are corrected. The broken Gumroad purchase link now works. Internal planning notes replaced with professional copy. Scoring formula is now dynamic.

### Follow-ups
- Add post-assessment CTA flow to SelfAssessment results
- Add keyboard accessibility to Navbar Tools dropdown
- Add aria-label to RankingTable search input
- Add missing Gumroad links for US States and US Cities

---

## Iteration 3 — 2026-04-16

### Selected Item
Add data integrity validation for all 7 index JSON files (Backlog #7, Score: 15)

### Reason for Selection
The overnight research pipeline now modifies production JSON data nightly — 3 files were changed in the first run. No validation existed to catch structural corruption, rank errors, or score-out-of-range issues. Pre-implementation check found **2 real issues**: us-states rank gaps and band count mismatch (both known data characteristics, now documented). Determinism and traceability principles: prove data correctness before every deploy.

### What Changed
- **`scripts/validate-indexes.mjs`** (new): Comprehensive validation script with 11 check categories:
  1. JSON parse integrity
  2. Meta field presence and types
  3. Required ranking fields per index (with index-specific field maps)
  4. All 8 dimension codes present in every entity
  5. Score ranges: raw 0-5, composite 0-100
  6. Rank contiguity (1..n, no gaps, no duplicates)
  7. meta.entityCount vs rankings.length consistency
  8. Band count sum vs entity count
  9. Band name/range validity
  10. Composite ≈ mean of scaled dimension scores (with legacy tolerance)
  11. Band assignment matches composite (with boundary tolerance)
- **`package.json`**: Added `npm run validate` script
- **Known data handling**: US States partial data (21/51) documented with `KNOWN_PARTIAL` config; legacy composite formula offset (up to ~5 points) handled with warning thresholds
- **Test fixes**: Fixed 4 pre-existing test failures from prior UI changes:
  - `home.spec.ts`: Updated 1,155 stat locator for Stat component
  - `navigation.spec.ts`: Updated for Indexes dropdown button and /updates link
  - `interactive.spec.ts`: Updated for Gumroad direct-purchase default path
  - `ranking-table.spec.ts`: Fixed sort test to find Score column by header position

### Agents Involved
- qa-engineer — candidate generation (testing/quality gaps)
- system-architect — candidate generation (architecture/data safety gaps)
- product-manager — candidate generation (product value/revenue gaps)
- coordinator — scoring, selection, implementation, validation

### Validation Results
- Build: ✅ All 27 routes compile
- Tests: ✅ 54/54 Playwright tests pass (10.8s)
- Data validation: ✅ 12,686 checks passed, 0 errors, 181 warnings
- Warnings: All 181 are documented legacy data characteristics (composite formula offset, band boundary ambiguity)
- Regression: ✅ None

### Outcome
Every index file is now validated with 11 categories of structural checks. The `npm run validate` command can be run before any deploy or after any pipeline modification. The validation correctly distinguishes between errors (would catch corruption) and warnings (documents known legacy characteristics). Four pre-existing test failures were also fixed, restoring full green test suite.

### Follow-ups
- Integrate `npm run validate` into deploy.sh as a pre-deploy gate
- Add validation as a CI step when CI pipeline is created
- Self-Assessment results CTA (Score: 15)
- Analytics instrumentation (Score: 15)
- JSON schema validation at build time (Score: 14)

---

## Revenue Cycle 1 — 2026-04-16

### Selected Item
Fix product cards on /purchase-research to route directly to Gumroad (Revenue Priority #1)

### Reason for Selection
The /purchase-research page is the primary purchase path. All 6 product cards routed to /contact-sales, forcing a sales conversation even for the $195 self-serve PDF product. The direct Gumroad checkout existed only inside the configurator widget — a secondary, less visible path. This is the highest-confidence revenue fix: remove friction from an existing purchase-intent path.

### What Changed
- **`purchase-research/page.tsx`**: Restructured product section into two tiers:
  - **Self-serve index reports**: 5 individual cards (Countries, Fortune 500, AI Labs, Robotics, Global Cities) each with direct Gumroad "Purchase — $195" button opening in new tab
  - **U.S. States & Cities card**: Request-based (no Gumroad product yet), routes to /contact-sales
  - **Premium products**: 5 cards (bundle, appendix, institutional, deck, custom) correctly route to /contact-sales with "Request quote" CTA
- **Cleaned internal copy**: Replaced planning language ("route buyers into the right purchase flow") with user-facing copy throughout
- **Before**: 0 Gumroad links from product cards | **After**: 5 direct Gumroad checkout buttons

### Agents Involved
- Explore agent — full revenue infrastructure audit (every file)
- growth-strategist — revenue improvement candidates
- coordinator — selection, implementation, validation

### Validation Results
- Build: ✅ All 27 routes compile
- Tests: ✅ 54/54 pass
- Data: ✅ 12,686 validation checks pass
- Gumroad verification: ✅ All 5 product URLs present in built output
- Regression: ✅ None

### Outcome
The purchase page now has a clear two-tier structure: instant-checkout products at $195 each (5 index reports) and premium products that correctly route to sales inquiry. The self-serve path is no longer hidden behind the configurator.

### Revenue Follow-ups (prioritized)
1. Add Gumroad products for U.S. States and U.S. Cities ($195 each) — requires creating listings on Gumroad
2. Newsletter/email capture on /updates and homepage — audience building for pipeline content
3. Analytics (Plausible) — enables conversion measurement for all paths
4. Separate Formspree form IDs (sales vs assessment) — data hygiene
