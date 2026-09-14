# QA Engineer Review — CB-MODEL and Continuous Research Pipeline

Date: 2026-09-14
Reviewer lens: quality, test and validation coverage
Constraints observed: read-only; no `npm run build`, no whole `npm test`, no prebuild/build-*/apply-*/export-* scripts, no writes except this file, no git writes.

---

## 1. Scope + commands run with results

I ran every individual `validate-*.mjs` and `test-*.mjs` script under `site/scripts/` directly with `node` (never the aggregate `npm test`, which the constraints prohibit and which also invokes `validate:evaluation-run` etc. — I ran those standalone instead), plus the two named research validators against live/current data. I did not run `npm run build`, `prebuild`, any `apply-*`/`export-*`/`build-*` script, or `research/scripts/integrity-check.mjs` (it is a writer — it emits `research/integrity-reports/<date>.md` — so I read its most recent committed output instead).

| Command | Result (verbatim, summarized where long) |
|---|---|
| `node site/scripts/validate-indexes.mjs` | PASS — 85,347 checks passed, 0 errors, **65 warnings** (override/formula drift, band-boundary entities, cross-index slug collisions) |
| `node site/scripts/validate-product-separation.mjs` | **RESULT: PASS (6 waived, 10 warning(s))** — Check 1 (name fusion): 0 findings. Check 2 (duplicate composite): 6 findings, all currently covered by waivers expiring 2026-12-09. Check 3 (deployed product inside ai-labs.json): 10 WARN. Check 4 (model discriminator): vacuous — no model index exists yet |
| `node site/scripts/validate-model-releases.mjs` | PASS (4 warnings) — scanState is `never-scanned`; K2/K12 scan-record checks SKIPPED (no scan tree) |
| `node site/scripts/lint-daily-briefings.mjs` | PASS — 81 files, 0 forbidden phrases/keys |
| `node site/scripts/validate-daily-briefings.mjs` | PASS — 79 of 79 briefings |
| `node site/scripts/validate-model-registry.mjs` | PASS — 0 entries (pre-execution state, correctly non-fabricated) |
| `node site/scripts/validate-evaluation-run.mjs` | PASS — 0 runs (correctly non-fabricated) |
| `node site/scripts/validate-task-bank.mjs` | PASS (1 warning — SYS dimension has 2 items, <0.5x even split) |
| `node site/scripts/test-scoring.mjs` | PASS — 125/125 |
| `node site/scripts/test-product-separation.mjs` | PASS — 16/16 fixtures |
| `node site/scripts/test-separation-waivers.mjs` | PASS — 17/17 |
| `node site/scripts/test-task-bank.mjs` | PASS — 68/68 |
| `node site/scripts/test-evaluation-scorer.mjs` | PASS — 45/45 |
| `node site/scripts/test-model-registry.mjs` | PASS — 38/38 |
| `node site/scripts/test-evaluation-statistics.mjs` | PASS — 78/78 |
| `node site/scripts/test-model-releases.mjs` | PASS — 93/93 |
| `node site/scripts/test-lint-briefings.mjs` | PASS — 11/11 |
| `node site/scripts/test-build-entity-history.mjs` | PASS — 39/39 |
| `node --no-warnings site/scripts/test-entity-href.mjs` | PASS — 40/40 |
| `node site/scripts/test-entity-records.mjs` | **FAIL — 19,672 passed, 1 failed** (exit code 1). See Finding QA-1 |
| `node research/scripts/validate-rotation-state.mjs` | **FAIL — 22 blocking, 39 warnings** (pre-existing, matches shared context's "23 pre-existing failures" figure closely — count moved by one since 2026-09-14 baseline note) |
| `node research/scripts/validate-scan.mjs 2026-09-14` | **FAIL — 1 blocking issue: `entity_reviews count 1331 != rotation entity count 1330`.** "Do NOT run the assessor." Also 3 warning classes fired, including the Slovenia/Cabo Verde/Jamaica URL-vs-evidence-date mismatches named in the shared context |
| Read `research/integrity-reports/2026-05-18.md` (not re-run; it writes) | Only committed run of the weekly independence audit, dated **2026-05-18 — 4 months stale against a spec that calls for weekly cadence.** Recorded FAIL on 2 of 5 checks |
| Manual re-check of Check 3's live FAIL against current `research/scripts/send-alerts.mjs` | The three flagged path strings are in a **comment block** documenting what the script must *not* read, not in executable read calls. The one-time FAIL appears to be a **false positive from naive text/path matching**, and nobody has re-run the check in 4 months to confirm or refute that |

Full failure/blocker output is quoted in the findings below rather than repeated here.

---

## 2. Gate inventory table

| Gate | What it guarantees | Known escapes | Wired into build/test/pipeline? |
|---|---|---|---|
| `validate-indexes.mjs` | Structural shape of the 8 index files, per-row formula-vs-published composite match, band-range membership, cross-index slug uniqueness | Escapes on **warning**, not failure: 0.6–10.3-point override/formula drift on 20 entities never blocks; cross-index slug collisions (18, e.g. Singapore country vs global-city) only WARN — the WORK_QUEUE and shared context both note this leaves a live slug ambiguity in production data | **Yes** — `npm run build` |
| `validate-product-separation.mjs` | No fused organisation/model names; no entity holding two published composites *unless waived*; deployed-product-inside-ai-labs flagged as WARN; model-discriminator check (currently vacuous) | Real defects (6 duplicate-composite groups, e.g. Microsoft AI vs Microsoft, Amazon AWS AI vs Amazon) are **converted to PASS by time-boxed waivers** expiring 2026-12-09, against a decision (D-13) still `proposed`, never ratified. A reader of `npm run build`'s green output has no way to see this without reading `DECISIONS.md` | **Yes** — `npm run build` (WORK_QUEUE.md WQ-P1-07 status text is now stale: it says "Not wired into `npm run build`" but `site/package.json` line 8 shows it is) |
| `validate-model-releases.mjs` | Release-watch store shape, append-only transitions, frozen-field integrity | Scan-record cross-checks (K2/K12) are structurally SKIPPED until a scan tree exists — currently 100% of releases (0) are validated against nothing but their own internal consistency | **Yes** — `npm run build` |
| `validate-model-registry.mjs` | Append-only registry, no identity overwritten by a re-used name, cardinality checks | Registry is empty (0 entries) — every check is currently vacuous | **Yes** — `npm run validate:model-registry`, but **not** in `npm run build` or `npm test`'s listed chain (verify: not present in `site/package.json` build/test strings) |
| `validate-evaluation-run.mjs` | Statistical-completeness gate per run: identity, trials, CI, audit hashes | 0 runs exist — vacuous by design, correctly labelled so | **Yes** — `npm test` |
| `validate-task-bank.mjs` | Task-bank schema, unfilled-placeholder detection, dimension-balance warning | Balance check is WARN-only; SYS dimension (2 items) can ship at half the even split forever without blocking | **Yes** — `npm run build`? No — check: not in `build` string, only `npm run validate:task-bank` and inside `npm test` | 
| `lint-daily-briefings.mjs` / `validate-daily-briefings.mjs` | No forbidden internal-pipeline phrases/keys in public daily JSON; briefing files parse and match a schema | Content **truthfulness** is entirely out of scope — the shared context's Slovenia/France/Jamaica factual errors and the invented "currency checks" claim all passed this gate, because it checks form and forbidden vocabulary, not whether a claim is true | **Yes** — `npm run build` |
| `test-scoring.mjs` / `test-entity-href.mjs` / `test-build-entity-history.mjs` / `test-lint-briefings.mjs` | Pure-function correctness of scoring formula, band assignment, routing, digest event-tiering logic against fixed fixtures | None of these touch live data — a formula can be 100% correct and every published row can still be wrong (see `validate-indexes.mjs` override drift above) | **Yes** — `npm test` |
| `test-product-separation.mjs` / `test-separation-waivers.mjs` | Guard logic itself is correct against synthetic fixtures (fusion detection, alias normalization, waiver expiry boundary, waiver staleness) | Fixture correctness says nothing about whether the founder actually resolves D-13 before 2026-12-09; the waiver mechanism is designed to fail open into a WARN-shaped narrative if unattended | **Yes** — `npm test` |
| `test-task-bank.mjs` / `test-evaluation-scorer.mjs` / `test-model-registry.mjs` / `test-evaluation-statistics.mjs` / `test-model-releases.mjs` | Correctness of scorer/statistics/registry logic against synthetic fixtures — bootstrap CI determinism, refusal exclusion, append-only invariants, draft-item exclusion | All pre-data. None has ever run against a real model output, because none exists yet. These are unit tests for machinery that has never been fed real input | **Yes** — `npm test` |
| **`test-entity-records.mjs`** | Full-corpus invariant check across all 1,309 entity records: composite/band/rank verbatim match to index files, 40-subdimension structure, subdimension-mean-to-dimension-score consistency, determinism, override-registry completeness | **Currently FAILING in the working tree** (1 of 19,673 checks) — see Finding QA-1. This is the single highest-value data-integrity check in the whole repo (19,672 real assertions against real production data, not fixtures) and it is **not invoked by `npm test`, not in `package.json` at all, and not in `.github/workflows/deploy.yml`** | **No.** Confirmed by grep of `site/package.json` (no `test:entity-records` script exists) and of `.github/workflows/deploy.yml` (only `npm test` and `npm run build` run in CI; neither reaches this file) |
| `research/scripts/validate-scan.mjs` | Nightly scanner-output integrity: coverage floors, tier-count cross-checks, source-date-vs-evidence-date consistency, batch honesty | **Structurally blind to date-correct-but-content-wrong claims** — by the coordinator's own account this is exactly how the France/Indonesia 2025-events-in-2026-dated-URLs defect got through. It also cannot detect a *factually false* claim inside a correctly-dated source (Slovenia "Israel's first embassy") | **No.** It is invoked only by human/agent discipline: `.claude/agents/overnight-scanner.md` Step 9 tells the scanner agent to run it and to stop if it fails. There is no CI job, cron, or git hook enforcing that the agent actually does this or obeys a FAIL. **Confirmed live-failing right now**: `node research/scripts/validate-scan.mjs 2026-09-14` returns `entity_reviews count 1331 != rotation entity count 1330`, blocking |
| `research/scripts/validate-rotation-state.mjs` | Every entity claiming `last_assessed` has a backing report on disk | **22 confirmed blocking failures today**, unchanged in kind since creation (2026-07-28) — entities that were never assessed but are marked as if they were, which the tool's own doc-comment says causes them to silently drop out of rotation for weeks | **No.** Same as above — agent-run only, no CI/cron enforcement found anywhere in the repo (`.github/workflows/` contains only `deploy.yml`) |
| `research/scripts/integrity-check.mjs` (Independence Safeguard Audit) | Structural separation between the assessment plane (index files, change proposals, assessments) and the commercial plane (Worker, alerts, Gumroad) — the mechanical backing for the entire "Independence policy" claim in `CLAUDE.md` | **Run exactly once, ever: 2026-05-18, four months before this review, against a "weekly" spec.** That single run FAILED 2 of 5 checks. One of the two (Check 3) appears on inspection today to be a **false positive** (naive string-match against a comment, not an executable read) that was never re-run to confirm. Check 1 flags every commit whose message doesn't contain one of five magic words, which will false-positive on any legitimate infra commit (e.g. the F-01/F-04 security fixes visible in this session's git log) as much as on a real violation — the check cannot currently distinguish "commercial code touched the index" from "a security patch didn't say the word 'assessor'" | **No.** No cron, no CI, no `npm` script found anywhere. This is the mechanical enforcement of the product's single most load-bearing credibility claim, and it has no scheduled trigger |
| Auto-deploy + post-deploy freshness check (`deploy.yml`) | A merged commit that passes `npm test`+`npm run build` reaches the VPS, and the live host is serving *this commit's* content (not a stale cached image) | Per shared context: 53 of the last N runs failed before 7 successes since 2026-09-09; freshness assertion checks only `updates/feed.json`'s latest date, **not** whether the applied index scores (composites, ranks) match what the commit intends — a stale-score-but-fresh-briefing-date deploy would pass this check | Yes, but its own track record (53 failures) shows "wired in" ≠ "reliable" |

---

## 3. Findings

### QA-1 — SEVERITY: HIGH (data integrity, live/public) — São Tomé and Príncipe is published twice under two different slugs with two different ranks, and the one test that catches it is not wired into anything

**Evidence.**

`site/src/data/entity-records/` contains two files for the same country:

- `sao-tome-and-principe.json` — `"name": "Sao Tome and Principe"`, composite 48.4, **rank 58**
- `s-o-tom-and-pr-ncipe.json` — `"name": "São Tomé and Príncipe"`, composite 48.4, **rank 60**

The second file's slug is the accidental output of `slugify()` (`name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")`) applied to a name containing diacritics — each of ã/é/í collapses a run of characters into a single hyphen, producing the garbled `s-o-tom-and-pr-ncipe`. `site/src/data/indexes/countries.json` itself only carries the ASCII row ("Sao Tome and Principe"), so the accented duplicate is an entity-record-store-only artifact, but it is **published to the public data surface the Worker reads for badges/alerts**:

```
site/public/data/scores/sao-tome-and-principe.json   → rank 59
site/public/data/scores/s-o-tom-and-pr-ncipe.json    → rank 60
```

(Note the *third* rank value, 59, in the public export vs. 58 in the entity-record source — a separate, smaller drift between the entity-records store and the generated public export, on top of the duplication.)

`node site/scripts/test-entity-records.mjs` catches exactly this:

```
FAIL [lookup] s-o-tom-and-pr-ncipe: slug "s-o-tom-and-pr-ncipe" not found in countries (slug collision or missing entity)
...
TOTAL: 19672 passed, 1 failed
```

Exit code confirmed as `1`. This is the same defect class the shared context names generically ("duplicate country rows (Cabo Verde/Cape Verde, São Tomé) passed validate-indexes for months") — I have now traced it to a concrete, reproducible, currently-failing artifact.

**Why it matters.** A subscriber who tracks São Tomé and Príncipe via the accented slug and one who tracks it via the ASCII slug get different published ranks for the same country from the same benchmark on the same day. This is a direct, customer-visible violation of "one entity, one score" and it is currently live.

**Root cause.** (a) A non-ASCII-aware slugify function with no normalization step (no NFKD/diacritic-stripping before the regex), and (b) `test-entity-records.mjs` — the only tool that would have caught this at commit time — was written but **never added to `site/package.json`'s `test` script or to `.github/workflows/deploy.yml`**. It is a fully dead gate: it runs, it fails, and nothing consumes that failure. This is the identical failure mode the repo's own CI comment calls out for a different script ("A script that is never executed in CI is a dead guard — the same class of defect as the product-separation validator that was wired to nothing," `.github/workflows/deploy.yml` lines 26-30) — meaning this exact class of defect has already been named once in this repo and reintroduced a second time in a different file.

**Recommended next action.** backend-engineer: add `"test:entity-records": "node scripts/test-entity-records.mjs"` to `site/package.json` and into the `test` chain; fix `slugify()` to strip diacritics via `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")` before the existing regex; delete or merge the orphaned `s-o-tom-and-pr-ncipe.json` record and its public export twin. Not a blocker for the PR/FAQ, but it is a **live defect today**, not a hypothetical one.

---

### QA-2 — SEVERITY: HIGH (governance/transparency) — The product-separation guard's PASS is manufactured by six time-boxed waivers against an unratified decision, and the CI-visible signal does not distinguish that from a clean pass

**Evidence.** `node site/scripts/validate-product-separation.mjs`:

```
Check 2 (duplicate publication):       6 finding(s), FAIL severity
...
RESULT: PASS (6 waived, 10 warning(s))
```

Each of the 6 findings — Microsoft AI (75.9) vs Microsoft (65.3), Amazon AWS AI (35.9) vs Amazon (12.8), Meta AI (26.3) vs Meta Platforms (7.8), Figure AI listed in both `ai-labs.json` and `robotics-labs.json`, 1X Technologies/Halodi Robotics likewise, and Boston Dynamics/"Boston Dynamics (SPOT demo)" — is a genuine violation of the stated rule "no entity may hold more than one published composite anywhere in the Compassion Benchmark" (D-13, root `DECISIONS.md`). D-13 is `proposed`, **not ratified** (confirmed: `.benchmark-ops/WORK_QUEUE.md` WQ-P0-05, still `OPEN`). The waivers all expire 2026-12-09, owner "founder," and were introduced specifically so the CI build would go green (WORK_QUEUE's own note: wiring the un-waived check into `validate-indexes.mjs`/`npm run build` "would block every build on pre-existing, un-triaged defects").

**Why it matters.** `npm run build` returning green is the only signal most downstream consumers (a deploy pipeline, a future engineer skimming CI, a PR/FAQ writer) will see. "PASS (6 waived)" and "PASS (0 findings)" render identically in a CI status badge. The gate is doing its job (surfacing real defects) but the packaging around it (waiver-to-PASS collapse with no separate exit code or badge state for "passed with live waived debt") creates exactly the kind of quiet erosion the independence/quality culture in this repo says it wants to avoid.

**Root cause.** Gate-design choice: waivers are a legitimate mechanism (the `test-separation-waivers.mjs` suite — 17/17 passing — shows the waiver *logic* itself is well-built: expiry boundaries, staleness detection, and "waiver does not leak across checks" are all tested). The gap is not in the waiver mechanism; it's that the CLI's final `RESULT: PASS` line does not differ, in exit code or headline, from a genuinely clean pass.

**Recommended next action.** Distinguish exit/status: `PASS`, `PASS-WITH-WAIVERS` (still exit 0, but a visibly different word and, ideally, a build-log warning banner), and `FAIL`. Coordinator/founder: track the 2026-12-09 waiver expiry as a hard date — if D-13 is still `proposed` on 2026-12-08, the build will fail the day the waivers lapse, which is correct behavior but should not be a surprise.

---

### QA-3 — SEVERITY: HIGH (pipeline currently blocked) — Today's scan (2026-09-14) fails its own integrity gate

**Evidence.**

```
node research/scripts/validate-scan.mjs 2026-09-14
...
FAILURES (blocking):
    x entity_reviews count 1331 != rotation entity count 1330
RESULT: FAIL — 1 blocking issue(s). Do NOT run the assessor.
```

This is today's date, the same day this review runs, and the shared context notes "a data change... is in flight." The gate is doing exactly what it is designed to do (block progression on a coverage-count mismatch), which is a point in favor of the gate's design. But it also means: as of this review, the nightly research pipeline for 2026-09-14 **cannot legitimately proceed to the assessor stage**, and there is no CI/cron enforcement of that "Do NOT run the assessor" instruction — it depends entirely on the agent invoking this script and honoring its exit code (see QA-4).

The same run's warnings independently reproduce two items named in the shared context as "known escapes": a Cabo Verde/Cape Verde split-name pair (same event, two spellings, both present) and the Slovenia embassy story's URL-date being one day *after* the claimed `evidence_date` (a different symptom of the same underlying "date-embedded-in-URL is not a reliable proxy for event-truth" problem the coordinator already flagged).

**Root cause.** Row-count drift between `entity_reviews[]` and the canonical rotation-state entity count — most likely a duplicate or a dropped entity in the scan write, consistent with the broader "duplicate row" defect class seen in QA-1.

**Recommended next action.** research/devops: do not run today's assessor stage against this scan file until `entity_reviews` count reconciles to 1330; identify which entity is duplicated or missing (a straightforward diff against `research/rotation-state.json` would find it in minutes — flagging for backend-engineer/devops-engineer, not doing it here per the read-only constraint).

---

### QA-4 — SEVERITY: MEDIUM-HIGH (structural) — The research pipeline's two most important integrity gates (`validate-scan.mjs`, `validate-rotation-state.mjs`) and the independence audit have zero machine enforcement; they run only if an agent chooses to run them and only block if that agent chooses to stop

**Evidence.** `.github/workflows/` contains exactly one file, `deploy.yml`, which runs `npm test` and `npm run build` for the **site**. Neither `validate-scan.mjs`, `validate-rotation-state.mjs`, nor `integrity-check.mjs` appears in any workflow, cron definition, or git hook anywhere in the repository (confirmed by grep across the repo root). Their only documented invocation point is prose instruction inside `.claude/agents/overnight-scanner.md` ("Step 9: Validate Evidence-Date Discipline... `node research/scripts/validate-scan.mjs ...`") and `validate-rotation-state.mjs`'s own header comment, which describes an ownership *convention* enforced by the assessor/scanner agent roles, not by tooling.

**Why it matters.** The shared context's own list of "known escapes" — the digest that shipped four factual errors past lint+validator, caught only by human/coordinator review — is direct evidence that "an agent is supposed to run the gate and stop on FAIL" is not a reliable control. `validate-rotation-state.mjs` has been failing with the same 22-ish blocking defects since 2026-07-28 (confirmed unchanged in kind today) with no CI red X anywhere to force attention, because there is no CI job that would turn red.

**Root cause.** Architectural: the research/continuous-scoring pipeline was built assuming a disciplined agent-in-the-loop, with validators as advisory scripts the agent is instructed to run, rather than as a scheduled/CI-enforced gate with an owner who gets paged on FAIL.

**Recommended next action.** devops-engineer: add a nightly scheduled GitHub Action (or equivalent) that runs `validate-scan.mjs` against the latest scan and `validate-rotation-state.mjs` against current rotation state, posting a persistent, visible FAIL status (issue or dashboard) independent of whether the agent that produced the data also chooses to check its own homework.

---

### QA-5 — SEVERITY: MEDIUM (governance claim vs. evidence) — The "Independence policy," CLAUDE.md's headline product guarantee, has its only mechanical audit four months stale, and that one run's FAIL may itself be a false positive that was never verified

**Evidence.** `research/integrity-reports/` contains exactly one file: `2026-05-18.md`. The spec (`integrity-check.mjs` header comment) calls for **weekly** execution. Today is 2026-09-14 — roughly 17 weekly cycles have elapsed with zero additional runs. The one committed run reported:

```
Check 1: Index files modified only by assessment pipeline | FAIL
Check 3: send-alerts.mjs does not read indexes or change-proposals | FAIL
```

I checked Check 3 against the current file: the three flagged path substrings in `research/scripts/send-alerts.mjs` are inside a **comment** (lines 8-10, documenting what must NOT be read), not inside any executable `readFileSync`/`import`/`require` call. The check appears to do an unqualified substring/path search that cannot distinguish documentation from a real read — a plausible false positive that has sat unresolved and unverified for four months because the tool that would re-check it hasn't been run.

**Why it matters.** This is the single check in the entire repo that stands behind the sentence "Entities never pay for inclusion, score changes, or suppression of findings" (CLAUDE.md). A PR/FAQ built on this product cannot honestly claim independence is *mechanically* verified on an ongoing basis; at best it can claim it was checked once, four months ago, and that check itself needs a second look.

**Root cause.** No scheduler; the tool is a writer (produces a dated Markdown report) with no cron/CI trigger, so — like QA-4 — it depends entirely on a human or agent remembering to invoke it.

**Recommended next action.** founder/devops-engineer: re-run `integrity-check.mjs` now (it is safe — read-only against git history plus one Markdown write) to get a current baseline before any PR/FAQ ships language about independence; then schedule it weekly as specified. If Check 1's keyword-matching (must contain "scanner, assessor, digest, founder, or score-updater") is the intended long-term design, note that it will also false-positive on legitimate non-pipeline commits (e.g., the security-fix commits visible in this session's own git log, F-01/F-04, do not contain those words) — the check's specificity should be revisited, not just its cadence.

---

### QA-6 — SEVERITY: LOW-MEDIUM (test design/CI hygiene) — Not every script wired into `npm test` on paper is actually reachable from `npm run build`, and the WORK_QUEUE.md status text for WQ-P1-07 is stale

**Evidence.** `WORK_QUEUE.md` (last updated 2026-09-07) states for WQ-P1-07: *"Not wired into `validate-indexes.mjs`/`npm run build`."* Reading the live `site/package.json` (build string, line 8) shows `validate-product-separation.mjs` **is** in the `build` chain today. Either the wiring happened after 2026-09-07 and the ledger wasn't updated, or the ledger was wrong at the time. Either way, a document whose stated purpose is to be the source of truth on "what actually guards the build" (`.benchmark-ops/WORK_QUEUE.md`'s own standing rule: *"Never mark work complete merely because code exists. Completion requires verification"*) is itself out of sync with the code it describes.

**Why it matters.** Anyone (including a PR/FAQ author) trusting the ledger over the code would understate the current gate coverage. This is a low-severity but structurally telling finding: the project's own meta-tooling for tracking gate status has the same staleness problem its gates are designed to catch in the product data.

**Recommended next action.** coordinator: reconcile `WORK_QUEUE.md` WQ-P1-07's status line against current `package.json` in the next ledger update pass.

---

## 4. Top 5 recommended improvements

### #1 — Wire `test-entity-records.mjs` into `npm test` and CI, and fix the diacritic-slug bug it caught

- **Type:** Test-coverage gap + concrete bug fix
- **Problem:** The repo's most comprehensive data-integrity test (19,673 assertions against live production data) is not run by anything. It is currently red (QA-1), and nobody would know without running it by hand, as I did.
- **Expected benefit:** Closes a live duplicate-publication defect (São Tomé and Príncipe) and — because the same slugify bug generalizes to any accented country/city name — prevents recurrence for e.g. any future entity with diacritics (Côte d'Ivoire's entity-record slug `c-te-d-ivoire.json` in the earlier grep output suggests this has already happened at least once more and simply hasn't been caught by this un-wired test's lookup path the same way).
- **Evidence:** `node site/scripts/test-entity-records.mjs` → exit 1, 1 of 19,673 failed; grep of `site/package.json` and `.github/workflows/deploy.yml` confirms it is absent from both.
- **Impact:** 5 — fixes a live public data-integrity defect and closes the exact "dead guard" pattern the repo has already named once.
- **Strategic alignment:** 5 — directly serves the core promise that a benchmark's scores are trustworthy and singular per entity.
- **Learning value:** 3 — reinforces the "wire the test or it doesn't exist" lesson already learned once (Worker typecheck comment in deploy.yml).
- **Confidence:** 5 — reproduced directly, fix is small and well-scoped (one npm script line + one slugify normalization line + one duplicate file removal).
- **Effort:** 2 — package.json edit, a 1-line `.normalize("NFD")` fix, delete/merge one JSON pair.
- **Risk:** 1 — low risk; the test itself is already proven safe to run repeatedly.
- **Priority Score:** 5+5+3+5−2−1 = **15**

### #2 — Add scheduled (non-agent-dependent) CI enforcement for `validate-scan.mjs` and `validate-rotation-state.mjs`

- **Type:** Pipeline reliability / gate architecture
- **Problem:** The two gates that catch scanner under-coverage, fabricated dates, and stale "last_assessed" claims run only if an agent remembers to invoke them and only block if that agent honors the exit code (QA-4). Today's scan is currently failing one of them (QA-3), and the rotation-state gate has been failing the same way since 2026-07-28 with no red CI signal anywhere.
- **Expected benefit:** Converts "advisory script an agent might run" into "always-on gate with a visible, owned FAIL state," closing the gap that let the France/Indonesia and Slovenia/Cabo Verde-class defects reach the digest.
- **Evidence:** Zero matches for either script in `.github/workflows/`; live FAIL reproduced on both scripts today.
- **Impact:** 5 — targets the exact class of escape named as the top known risk in the shared context.
- **Strategic alignment:** 5 — continuous research pipeline is core to the product's differentiation from a static ranking site.
- **Learning value:** 3 — establishes the general pattern ("every validator gets a scheduled runner, not just a doc reference") reusable for future gates.
- **Confidence:** 4 — mechanically straightforward (scheduled workflow, existing scripts, just needs data-file discovery logic for "latest scan").
- **Effort:** 3 — needs a scheduling trigger, a way to locate "today's" scan/rotation files, and a notification/issue-creation step.
- **Risk:** 2 — low technical risk; main risk is alert fatigue if the known 22 pre-existing rotation-state failures aren't baselined/waived similarly to the product-separation waiver pattern, so this ships alongside a one-time triage of those 22.
- **Priority Score:** 5+5+3+4−3−2 = **12**

### #3 — Re-run and re-schedule the Independence Integrity Audit (`integrity-check.mjs`) before any PR/FAQ language claims ongoing independence verification

- **Type:** Governance / trust-claim substantiation
- **Problem:** The one mechanical audit behind CLAUDE.md's core "entities never pay for inclusion, score changes, or suppression" claim is 4 months stale and its last run recorded a FAIL that looks, on inspection, like a possible false positive nobody re-checked.
- **Expected benefit:** Either confirms independence holds (with fresh, dated evidence a PR/FAQ can actually cite) or surfaces a real contamination path before external claims are made about it.
- **Evidence:** Single file in `research/integrity-reports/`, dated 2026-05-18; Check 3's flagged strings verified today to be comment-only in `send-alerts.mjs`.
- **Impact:** 4 — reputational/trust risk if a PR/FAQ asserts independence is "verified" and it hasn't been checked in months.
- **Strategic alignment:** 5 — independence is the named differentiator of the entire institution per CLAUDE.md.
- **Learning value:** 2 — narrower lesson than #1/#2 but same family (schedule the gate).
- **Confidence:** 4 — running the script is low-risk (it writes one dated Markdown file); interpreting a stale FAIL correctly requires a person, which is exactly why it hasn't happened.
- **Effort:** 2 — running it is one command; scheduling it weekly is a small addition to whatever mechanism #2 introduces.
- **Risk:** 2 — the audit itself might surface a real, unflattering finding — that is the point, but it needs a human owner ready to act on it before external claims are finalized.
- **Priority Score:** 4+5+2+4−2−2 = **11**

### #4 — Make waived findings visibly distinct from a clean pass in `validate-product-separation.mjs`'s exit signal, and put the 2026-12-09 waiver expiry on someone's calendar now

- **Type:** Gate-signal fidelity
- **Problem:** "PASS (6 waived, 10 warnings)" and "PASS (0 findings)" are both green in CI. Six real, named violations of an unratified-but-cited decision (D-13) are currently indistinguishable in build status from a clean state.
- **Expected benefit:** Prevents the specific failure mode where a green build is silently read as "no known issues" by anyone who doesn't dig into the log — including future reviewers, the coordinator, or an external auditor.
- **Evidence:** Direct CLI output; waivers all recorded with `expires 2026-12-09`, D-13 still `proposed` per `WORK_QUEUE.md` WQ-P0-05.
- **Impact:** 4 — governance/transparency, not a data-correctness bug, but load-bearing for how "PASS" is trusted going forward.
- **Strategic alignment:** 4 — matches the repo's own stated value ("never mark work complete merely because code exists").
- **Learning value:** 3 — reusable pattern for any future waiver-bearing gate (the model-discriminator check will need this exact treatment once a model index exists).
- **Confidence:** 4 — the waiver test suite already exercises the underlying logic; this is a reporting/exit-code change, not new logic.
- **Effort:** 2 — small script change plus a calendar/ownership action for the founder.
- **Risk:** 1 — very low technical risk.
- **Priority Score:** 4+4+3+4−2−1 = **12**

### #5 — Add a VAL-R-01-style stability/regression check to the model harness's task bank and evaluation pipeline before the first real model run, given the institution index's own documented instability

- **Type:** Missing validation gate (forward-looking, CB-MODEL-specific)
- **Problem:** `.benchmark-ops/VALIDATION_LEDGER.md` names test-retest stability (VAL-R-01) as its own top planned priority, citing a concrete precedent: the *existing* institutional pipeline scored ADP at 58.1 and 60.6 three days apart (crossing a band boundary) and swung Kazakhstan 24.4→13.7 in four days. All CB-MODEL scoring/statistics tests I ran (`test-evaluation-statistics.mjs`, 78/78; `test-evaluation-scorer.mjs`, 45/45) validate correctness of the math against synthetic fixtures, but there is **no test anywhere in the repo that would catch a repeat of the ADP/Kazakhstan-style instability once real model runs begin**, because no run has happened yet and the analysis layer has never been exercised end-to-end against two independent scorings of the same input.
- **Expected benefit:** Catches instability before it reaches a published model score, rather than after — the institutional pipeline had no such gate and only found the problem in `DECISIONS.md` D-07 after the fact.
- **Evidence:** `.benchmark-ops/VALIDATION_LEDGER.md` VAL-R-01 row, D-07 citation; confirmed 0 rows in the Studies table ("0 rows"); confirmed via `validate-evaluation-run.mjs` that 0 runs exist to test against yet.
- **Impact:** 4 — prevents a known, already-demonstrated failure mode from recurring in the new instrument.
- **Strategic alignment:** 5 — this is explicitly named as the validation program's own top planned priority.
- **Learning value:** 4 — building this now (as a synthetic-fixture test, per WQ-P1-06's "buildable now" framing) establishes the harness pattern before real budget/credentials unblock actual runs.
- **Confidence:** 3 — buildable today against synthetic double-scored fixtures without needing WQ-P0-01's budget approval, but real validation requires an actual repeated run later.
- **Effort:** 3 — needs a small test harness that runs the same synthetic manifest through the analysis layer twice and asserts stability bounds; moderate design work to choose a meaningful tolerance.
- **Risk:** 2 — designing the tolerance threshold before any real data exists risks it being either too loose (useless) or arbitrary; should be revisited once real runs exist.
- **Priority Score:** 4+5+4+3−3−2 = **11**

---

## 5. PR/FAQ inputs

**Customer problem this validation work addresses:** A reader of the Compassion Benchmark site or a prospective model-index subscriber needs to trust that (a) a given entity has exactly one current score, not two disagreeing ones, (b) the published claims in daily briefings are factually true, not merely well-formatted, and (c) "independent" is a verified, ongoing mechanical property of the institution, not a one-time claim. Today, on all three counts, the honest answer is "partially, and here is the gap."

**Hard FAQ questions and honest answers:**

1. **Q: If I look up the same country under two different name spellings, will I get the same score?**
   A: Not always, today. São Tomé and Príncipe currently has two published entity records (`sao-tome-and-principe` and the diacritic-mangled `s-o-tom-and-pr-ncipe`) with different ranks (58/59 vs. 60) for the same composite score, because the slug-generation function doesn't normalize accented characters. The one test that would have caught this before it shipped exists but was never wired into the test suite or CI. This is a known, reproducible, currently-live defect (see QA-1) with a scoped fix in progress.

2. **Q: Does a green build mean there are zero governance violations of your "one entity, one score" rule?**
   A: No — it currently means zero *un-waived* violations. Six real duplicate-composite publications (e.g., Microsoft AI vs. Microsoft, Amazon AWS AI vs. Amazon) exist right now, are correctly detected by the guard, and are passing the build only because of time-boxed waivers expiring 2026-12-09, against a demarcation decision (D-13) that has never been formally ratified. If that decision isn't resolved by then, the build will start failing — which is intentional, but worth knowing before quoting "build passes" as evidence of clean separation.

3. **Q: How do you know your daily briefings and score changes are factually accurate, not just well-formatted?**
   A: We don't have an automated check for factual accuracy — only for forbidden internal vocabulary, schema shape, and date-consistency between a source URL and a claimed evidence date. The team's own record shows this gap is real: several factual errors (a false "Slovenia opens Israel's first embassy" claim, an inverted causality claim about France, an invented "currency checks are now standard" claim) passed every automated gate and were caught only by manual coordinator review after publication. Today's scan run (2026-09-14) is itself currently failing its own coverage-integrity check and has been told not to proceed to the next stage.

4. **Q: Is "independence" — that entities can't pay for a better score — something you check mechanically, or is it a policy you just state?**
   A: There is a mechanical audit for it (`integrity-check.mjs`), but it has been run exactly once, on 2026-05-18, against a spec that calls for weekly checks — a four-month gap as of this review. That single run recorded two failures; one of them looks, on a fresh read of the current code, like it may have been a false positive (flagging a comment, not an actual data read) that was never re-verified. We recommend re-running this and putting it on a real schedule before making independence claims in external-facing material.

5. **Q: For the AI model benchmarking program (CB-MODEL), how much of "we have tests" reflects testing against real model behavior versus testing against made-up fixtures?**
   A: Entirely the latter, honestly and by design at this stage. Every CB-MODEL test that passed in this review (scorer, statistics, registry, releases, task bank — several hundred assertions total) runs against synthetic fixtures, because CB-MODEL is pre-evaluation: 0 models scored, 0 runs recorded, 0 validity studies completed (`.benchmark-ops/VALIDATION_LEDGER.md` is explicit about this). That is the correct, honest state for where the program is — the risk is only in how it gets described externally: "tests passing" should not be read as "the benchmark has been shown to measure compassion," which nothing in the repo yet claims to demonstrate.

---

**Summary of commands and artifacts referenced above:** all commands were run from `C:\Users\philk\applied-compassion-benchmark` (site scripts from `site/`, research scripts from repo root) on 2026-09-14, read-only, against the working tree as found. No files were modified except this report.
