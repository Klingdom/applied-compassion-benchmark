# Test plan: quality and validation layer of the AI model evaluation pipeline

Status: PROPOSED (D-60; nothing here ratifies PROTOCOL-V2-2). Author: QA, 2026-10-22. No model was run to produce it.
Paths are relative to the repo root. `T:` = `research/model-runs/tests/`, `S:` = `site/scripts/`, `L:` = `research/model-runs/lib/`.

## 0. Measured baseline (all run 2026-10-22, from `site/`, no build, no model)

| Command | Result |
|---|---|
| `npm run test:model-runs` (wraps `node --test` over `T:*.test.mjs`, 16 files, `S:test-model-runs.mjs`) | 259 tests, 259 pass, 0 fail, 0 skip |
| per file, `node --test T:<file>` (sum = 259) | weekly-wave 56, self-identifying 47, judging-prep 29, arms 19, mcp-probe 17, local-subjects 15, reroute 14, routing-and-answers 13, leak-and-serving 10, e2e-and-hygiene 9, preregistration-integrity 7, system-message 7, bridge-routed 5, normalise 5, defer-build 4, analyze-pilot 2 |
| `npm run test:model-waves` | 308 passed, 0 failed |
| `npm run test:model-harness` (`research/scripts/model-harness/tests/acceptance.test.mjs`) | 58 passed, 0 failed |
| `npm run test:model-wave-isolation` | 24 passed, 0 failed |
| `npm run test:model-wave-export` | 23 passed, 0 failed (the "FAILED" lines in its output are negative controls) |
| `npm run test:model-html-leak` / `npm run test:model-machine-leak` | 619 / 354 passed, 0 failed |

Caveats:
- Four tests are conditional on pilot data (`skip:` at `T:analyze-pilot.test.mjs:26,32` and `T:self-identifying.test.mjs:127,135`). Skip count was 0 today, so they ran.
- `test:model-harness` tests a different, synthetic-fixture harness (`research/scripts/model-harness/`), not `research/model-runs/`. It does not cover the weekly wave pipeline.
- There is no coverage tool. "Covered" below means a named test exercises the behaviour, not line coverage.

## 1. Coverage map (stage -> tests -> result today)

Stages follow `.claude/commands/weekly-model-wave.md` and v2 §3 (`docs/MODEL_TESTING_V2_PROPOSAL.md:74-86`).

| Stage | Tests (file:line, name) | Today |
|---|---|---|
| 1 Plan / select | `T:weekly-wave.test.mjs:98` protocol+queue validate; `:126,:140,:144,:157` selection; `:184,:202` config build; `:276` proposed protocol refused | pass |
| 2 Preregister | `T:preregistration-integrity.test.mjs:57,64,69` hash, edit and removed-deviation controls; `T:weekly-wave.test.mjs:337,368` render and edit detection; `:213-264` conformance incl. planted changes | pass |
| 2b Plan committed before data | `T:weekly-wave.test.mjs:515,530,540` (`planCommitState`) | pass, but see FM-6: checks "committed and unmodified", not "older than the first record" (`L:weekly.mjs:718-730`) |
| 3 Collect (local) | `T:local-subjects.test.mjs:56-309` (seeds, fresh single-message call, digest mismatch, resume, retry 2x, circuit breaker 5, atomic writes, 10% instrument rule); `T:weekly-wave.test.mjs:565,583,597,629,643,659,670` (memory defer, lock, finalise, partial, thrown error) | pass |
| 3b System message / arms | `T:system-message.test.mjs:26-53`; `T:arms.test.mjs:89-281` | pass |
| 4 Variance check (v2 stage 4) | NONE. No code, no test | not built |
| 5a Subject brief leak | `T:leak-and-serving.test.mjs:27-150` (planted anchor, item id, dimension code, construct, rubric words; real bank); `T:e2e-and-hygiene.test.mjs:77`; `T:local-subjects.test.mjs:82,100` (outgoing check) | pass |
| 5b Judge batch build / blinding | `T:judging-prep.test.mjs:100-186,352-418`; `T:routing-and-answers.test.mjs:28-162`; `T:arms.test.mjs:292` | pass |
| 5c Self-identifying replies | `T:self-identifying.test.mjs` (47; real pilot-3: 1 of 1,328) | pass; report-only, never blocking (`T:judging-prep.test.mjs:418`) |
| 5d Judge answers ingest | `T:routing-and-answers.test.mjs:162-252`; `T:e2e-and-hygiene.test.mjs:90,115,241` | pass |
| 5e Judge validity gate | `T:judging-prep.test.mjs:443-528,600,711-795` (5.0% boundary, stale report, one or two failing judges) | pass |
| 5f Reroute / requote / supplement | `T:reroute.test.mjs:39-583` | pass |
| 5g Bridge / anchor sample | `T:judging-prep.test.mjs:302,332,653,696`; `T:bridge-routed.test.mjs:91-148` | pass |
| 5h Judge tool-use (`tool_uses == 2`) | NONE. Operating rule only (`research/model-runs/README.md:67-70`); `grep tool_uses` over `lib/ bin/ tests/` = 0 hits | not enforceable in code |
| 6a MCP contamination probe | `T:mcp-probe.test.mjs:91-557` (client timeouts, write root, unparseable answer, trivial recall, digest, finish refuses without validity report) | pass |
| 6b Assemble / score | `T:e2e-and-hygiene.test.mjs:146` end to end on a synthetic bank; `:282` no scoring arithmetic; `T:reroute.test.mjs:253` composite equals `computeCompositeFromDimensions` | pass |
| 6c Analysis | `T:analyze-pilot.test.mjs:26,32` byte-for-byte regeneration (pilot-1, pilot-2); `T:arms.test.mjs:504-538` | pass; pilot-3 is not in the regeneration test |
| 6d Anchor verdict | `T:weekly-wave.test.mjs:434` below/at/above threshold, missing figure | pass; mean absolute only. Signed drift is computed (`bin/analyze-pilot.mjs:479-492`) but not gated |
| 7 Claim audit (`audit-wave.mjs`) | NONE; script does not exist (§3) | not built |
| 8 Gate packet (`wave-ready.mjs`) | NONE; script does not exist | not built |
| 9a Wave export + isolation | `S:test-model-wave-export.mjs` (23), `S:test-model-wave-isolation.mjs` (24), `S:test-model-waves.mjs` (308; W-* rules incl. W-judge-validity, W-forbidden-key, W-comparability, W-publication, W-official) | pass |
| 9b Public leak / blinding of output | `S:test-model-html-leak.mjs` (619), `S:test-model-machine-leak.mjs` (354; positive control for separated points at lines 43-45) | pass |
| Report prose / dashboards | `S:test-model-reports.mjs` (G1-G21, map at line 23), `test-model-report-html`, `-dashboard`, `-report-seo`, `-pilot-figures` | not run by me (publication layer, run in `npm test`) |
| Scheduler / OS | `weekly/register-task.ps1` has no test | untested |

Stages with no test: variance check, judge tool-use compliance, claim audit, gate packet, scheduler registration, hosted-API collect (does not exist), judge agreement floor, signed anchor drift, plan-older-than-first-record, key-commit policy, pilot-3 analysis regeneration, and a full `plan -> collect -> judge -> analyse -> export` run (only pieces exist; `T:e2e-and-hygiene.test.mjs:146` covers the pilot-style path).

## 2. Failure-mode catalogue for a weekly wave

Probe convention: a "planted probe" is a deliberately bad fixture that MUST trip the guard, run next to a clean fixture that MUST pass (V8: every absence assertion needs a positive control). All run offline with a fake Ollama (mock-fetch pattern: `T:local-subjects.test.mjs:293`; loopback fake: `T:mcp-probe.test.mjs:509`).

| # | Failure mode | Existing guard | Gap | Proposed test and planted probe |
|---|---|---|---|---|
| FM-1 | Data leakage: rubric/anchors reach a subject | Brief and outgoing leak checks (`T:leak-and-serving.test.mjs:40,51`; `T:local-subjects.test.mjs:82,100`); system message vocabulary (`T:arms.test.mjs:255`) | "No file tools for subjects/judges" is an unenforceable operating rule (`README.md:29-31`); `keys/` is committed (FM-11) | EV-1: plant `CANARY-<uuid>` in a fixture rubric and fixture `keys/`; assert no brief, batch, system message or probe brief contains it. Probe: canary inside a judge batch scaffold must trip `assertBatchesBlind`. |
| FM-2 | Contamination (item pool is public) | MCP exposure probe (`T:mcp-probe.test.mjs`); README limit 4 (`README.md:281-282`) | Probe samples a handful of items; no pass/fail threshold; not in any gate | EV-2: fake probe answers from a model that recites the published anchor verbatim; assert the wave's contamination field is flagged. Clean control: random recall, not flagged. |
| FM-3 | Judge invalidity | 5% unfound-quote rule, strictly greater (`T:judging-prep.test.mjs:443,488,600,711,774`); verbatim check (`T:routing-and-answers.test.mjs:226`); `T:normalise.test.mjs` | Validity measures quote grounding only, not rating sanity | EV-3: planted judge gives 5 to every reply with a valid quote (0% unfound). A new constant-rating/variance floor must fail it. Probe 2: judge quotes the first 12 characters of every reply. |
| FM-4 | Judge disagreement / same-family bias | Claude-only panel is structural (`docs/MODEL_TESTING_V2_PROPOSAL.md:15`); `judge_agreement` computed (`bin/analyze-pilot.mjs:155-158`) | No floor enforced anywhere (v2 gate 4 unbuilt) | EV-4: fixture `analysis.json` with `judge_agreement.exact` 0.30 for one subject; gate must fail. At floor passes; floor minus 0.001 fails. |
| FM-5 | Instrument drift (anchor sample) | `anchorVerdict` mean-absolute only (`L:weekly.mjs:625-631`; `T:weekly-wave.test.mjs:434`) | Signed per-judge drift is computed (`bin/analyze-pilot.mjs:479-492`) but not gated, so a one-directional per-judge shift is not named | EV-5: fixture `bridge_drift` with judge A +0.4 and judge B -0.4 (the mean absolute value is 0.4; if the threshold is above that it passes today); a signed per-judge check must flag it. Control: zero drift passes. |
| FM-6 | Preregistration violation | Hash and append-only deviations (`T:preregistration-integrity.test.mjs:64,69`); conformance (`T:weekly-wave.test.mjs:243`); committed+unmodified (`:515,530`) | `planCommitState` never compares commit time with the first record timestamp (v2 gate 1, `docs/MODEL_TESTING_V2_PROPOSAL.md:122`); a plan committed after collection passes if clean | EV-6: temp git repo; records with `started_at` T0, plan committed at T0+1h; new `planBeforeData()` must fail. Control: plan at T0-1h passes. Fix dates with `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE`. |
| FM-7 | Partial runs | `--limit` not finalised (`T:weekly-wave.test.mjs:629`); more than 10% failed = instrument failure (`T:local-subjects.test.mjs:259`); finalise with failures is a failure (`:670`); missing batch refused (`T:e2e-and-hygiene.test.mjs:241`) | v2 gate 2 "pre-registered classification of failures" unbuilt; 1-10% failures flow into a composite silently | EV-7: fixture run with 5% failed trials; assert the count is in the wave file and the gate packet. Planted: all failures on one item/dimension; assert a clustering warning. |
| FM-8 | OOM / host stop / truncation | Memory defer exit 5 (`T:weekly-wave.test.mjs:420,565`); stale lock 12 h (`:401`); circuit breaker 5 (`T:local-subjects.test.mjs:273`); atomic records (`:283`) | Ollama 600 s timeout (`L:ollama.mjs:20`) untested; `done_reason` is stored (`L:local-subjects.mjs:418`) but never checked; only `seed` is set (`:408`), no `num_ctx`/`num_predict`, so truncation depends on the Modelfile | EV-8: fake Ollama returns `done_reason: "length"` on 3 of 20 replies; assert a truncation count surfaces and flags above a threshold. Control: all `"stop"`. Second probe: a fake that hangs; assert a failed record, not a hang. |
| FM-9 | Non-determinism | Seed derivation (`T:local-subjects.test.mjs:56`); batches identical on same seed (`T:judging-prep.test.mjs:396`); analysis regenerates (`T:analyze-pilot.test.mjs:26,32`) | GPU sampling is not bit-reproducible even with a seed; v2 variance check unbuilt; pilot-3 not in regeneration test | EV-9: run the same fake-Ollama fixture twice, assert byte-identical wave export (§4). Variance probe: fake returns different text on the second call; `variance.json` must report exact-match < 1 (once stage 4 exists). Add pilot-3 to the regeneration test (data exists). |
| FM-10 | Mislabelled arms / builds | Arm rules (`T:arms.test.mjs:99-148`); digest pinned and checked before any call (`T:local-subjects.test.mjs:138,309`); conformance (`T:weekly-wave.test.mjs:243`) | Nothing re-verifies after collection that records' `build`/`arm`/`system_message_sha256` match the config | EV-10: swap `arm` A and B in 3 records of a finished fixture; assemble/analysis must refuse. Second probe: change one record's digest. Control: untouched passes. |
| FM-11 | Key-file commit | `--key-out` must be outside `--out` (`T:e2e-and-hygiene.test.mjs:66`). No ignore rule: `git ls-files research/model-runs \| grep -c "keys/"` = 15 tracked key files (5 under pilot-2026-10-03) | Committing keys after the run is the current practice; no test that keys are not committed BEFORE judging ends, none that they stay out of site output | EV-11: temp git repo; commit `keys/judge-key.json` while phase is `judging`; new check must fail. Control: after `analysed` passes. Extend `S:test-model-machine-leak.mjs` with a canary: no `*key*.json` from model-runs in `site/public` or `site/out`. |
| FM-12 | Secondary-arm point exposure | `projectWavePublic` withholds (`S:test-model-machine-leak.mjs:62`), positive control that separated points ARE present (`:43-45`); `W-forbidden-key` in `S:test-model-waves.mjs`; `S:test-model-html-leak.mjs` | Covered for committed waves plus one synthetic arms wave (`:41`); a point under a NEW field name is not probed | EV-12: add `secondary_arm.composite_mean` to a synthetic arms wave; machine-leak and `W-forbidden-key` must trip. Control: separated primary point still present. |
| FM-13 | Judge compliance (tool use, voids) | `tool_uses == 2` is manual (`README.md:67-70`); `operations/judge-batches.voided.txt` exists for pilot-3 | Not machine-checked; the ledger TSVs (`operations/judge-batches.ledger.tsv`) have no schema test | EV-13: ledger validator. Planted row `tool_uses=3` marked accepted -> fail; row `2` -> pass; a batch in the key with no ledger row -> fail. |
| FM-14 | Hidden thinking traces (qwen3 `message.thinking`) | None. `grep think` in `L:local-subjects.mjs`, `L:ollama.mjs` = 0 hits; flagged in `research/model-runs/weekly/READINESS_2026-10-15.json` | Thinking tokens inflate `eval_count`; trace not stored | EV-14: fake Ollama returns `message.thinking`; assert the plan refuses or stores it (decision-dependent). |

## 3. Wave acceptance checklist (results may not be reviewed until these pass)

Existence check, 2026-10-22: `ls research/model-runs/bin | grep -c weekly` = 1 (positive control: the pattern finds a real file); `ls research/model-runs/bin | grep -c -E "audit|ready"` = 0; `find . -name "audit-wave*" -o -name "wave-ready*"` (node_modules excluded) = no output. `audit-wave.mjs` and `wave-ready.mjs` DO NOT EXIST.

| # | Gate | v2 §4 gate (`docs/MODEL_TESTING_V2_PROPOSAL.md:120-131`) | Script / command today | Status |
|---|---|---|---|---|
| A1 | Protocol ratified; config conforms to it | 1 | `weekly-wave.mjs check --run-id $RUN` (`L:weekly.mjs:561`) | exists |
| A2 | Plan commit older than the first call record | 1 | `planCommitState` (`:718`) checks clean+committed only | PARTIAL: build `planBeforeData()` (EV-6) |
| A3 | Record digests equal the pinned digests | 1 | run-time check `T:local-subjects.test.mjs:138`; no post-hoc audit | PARTIAL (EV-10) |
| A4 | Completeness: every planned call `ok`; failures <= 10% and listed; no truncation | 2 | `weekly-wave.mjs status`, `collect-status.json`; 10% rule `L:local-subjects.mjs:584` | PARTIAL (EV-7, EV-8) |
| A5 | Brief and outgoing leak checks pass | 7 | `build-subject-briefs.mjs`; run-time check | exists |
| A6 | Self-identifying replies counted and reported | 7 | `L:self-identification.mjs`; `analysis.json` field | exists (report-only) |
| A7 | 2 judges per reply, non-self, cross-family; batches blind | 3 | `build-judge-batches.mjs`; `assertBatchesBlind` | exists |
| A8 | Judge compliance ledger (`tool_uses == 2`, voids kept) | 3 | manual | MISSING (EV-13) |
| A9 | Judge validity <= 5% unfound per judge; short quotes supplemented | 3 | `judge-validity.mjs` (exit 0/1/4/5); assembly refuses a stale report | exists |
| A10 | Judge sanity (not constant, not copy-first-characters) | 3 (implied) | none | MISSING (EV-3) |
| A11 | Per-subject judge agreement >= floor; signed Claude minus non-Claude gap reported | 4 | field computed (`bin/analyze-pilot.mjs:155`); no floor | MISSING gate (EV-4); floor needs ratification |
| A12 | Anchor: mean absolute drift <= threshold AND per-judge signed drift reported | 5 | `anchorVerdict` (`:625`); `weekly-wave.mjs status` | PARTIAL (EV-5) |
| A13 | Variance check (hosted subjects) | 6 | none | MISSING; record "n/a, local only" for local waves |
| A14 | Contamination probe completed, not INCOMPLETE | 7 | `run-mcp-probe.mjs --phase finish` (refuses without validity report) | exists; no threshold (EV-2) |
| A15 | No key committed before judging ends; no key in site output | 7 | none | MISSING (EV-11) |
| A16 | Wave export deterministic and equals regeneration | 10 | `export-wave.mjs --check` | exists |
| A17 | Public output rules: no ranks, ranges only, withheld points, pilot label, no cross-wave axis | 10, 7 | `test:model-waves`, `-wave-isolation`, `-html-leak`, `-machine-leak`, `-reports` (G1-G21) | exists (308/24/619/354 today) |
| A18 | Claim audit: every draft token re-derived from raw records, 0 open | 8 | manual, per `docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md` | MISSING `audit-wave.mjs` |
| A19 | Spend within ceiling | 9 | none | n/a (no hosted spend exists) |
| A20 | Gate packet written (pass/fail per gate, deviations) | 8 | none | MISSING `wave-ready.mjs` |
| A21 | `npm run test:model-runs` and `test:model-waves` green on the commit | - | 259/259 and 308/308 today | exists |

Reviewer rule: results are reviewed only if A1-A12, A14-A18, A20 are green or a dated deviation (`D<n>`, pre-registered or post-hoc) justifies the exception. A13 and A19 are written "n/a" for local-only waves, not left blank.

## 4. Regression suite proposal: full pipeline on fixtures (no model, no key)

Goal: one test file that runs plan -> collect -> ingest -> judge batches -> fake judge answers -> validity -> reroute/supplement -> probe -> analyse -> export -> gates offline in a temp dir. Proposed file: `research/model-runs/tests/pipeline-regression.test.mjs`. `S:test-model-runs.mjs` enumerates `*.test.mjs`, so it joins `npm test` automatically.

Inputs, committed under `research/model-runs/tests/fixtures/pipeline/`, small and synthetic:
1. A 12-item synthetic bank (pattern in `T:helpers.mjs` and `T:e2e-and-hygiene.test.mjs:146`); `bank_sha256` computed at test time.
2. A synthetic ratified protocol and queue (3 queued builds plus the reference).
3. A fake Ollama (injected `fetchImpl`, `L:ollama.mjs:20`) that answers from a table keyed by `sha256(message)+seed`, so a reply is a pure function of the input. Scripted faults: one empty reply (retry), one `done_reason: length`, one self-naming reply.
4. Scripted fake judges: rating from a seeded PRNG keyed by `response_id`, quote = first 5 words of the reply. One planted bad judge (30% fabricated quotes) to force exclude and reroute.
5. A temp git repo per test (`git init`, fixed identity, fixed `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE`) so the plan-committed gate runs for real.
6. The real MCP server, offline, as in `T:mcp-probe.test.mjs:239`.

Steps and assertions:

| Step | Command (in temp repo) | Expected |
|---|---|---|
| plan | `weekly-wave.mjs plan --date 2026-01-05` with injected `/api/tags` | `run-config.json`, `PREREGISTRATION.md`, `weekly.json`; `check` exit 0 |
| uncommitted gate | `collect` before the plan commit | exit 1, no records (as `T:weekly-wave.test.mjs:515`) |
| collect | commit plan; `collect` | exit 0, phase `collected`; planned = ok + scripted failures; failed < 10% |
| judge | `ingest-answers`, `build-judge-batches`, fake judges, `judge-validity` | planted bad judge -> exit 4; others pass |
| reroute | `reroute-judges --exclude-judge <bad> --requote`, then `--supplement` | every pair cross-family, non-self, 2 distinct judges |
| probe, analyse | `run-mcp-probe`, `analyze-pilot` | valid `analysis.json`; `bridge_drift` present; `comparable` true with zero-drift judges, false with injected +1 drift |
| export | `export-wave`, then `--check` | both exit 0; the wave satisfies the `S:test-model-waves.mjs` rules |
| negative rows | each of EV-1..EV-14 as a mutation of the finished fixture | each exits non-zero with its named reason; the unmutated fixture exits 0 (positive control) |

Determinism:
- Fixed `master_seed` and `--seed` everywhere (otherwise a random seed is recorded, `README.md:209-210`); `--date` fixed; injected `now()` (exists in `acquireLock`, `L:weekly.mjs:662`, and `collectWave` `deps`).
- Strip or fake wall-clock fields (`started_at`, `finished_at`, `wall_s`) and temp paths before any byte comparison; normalise to LF (Windows host; LF-only is asserted at `T:weekly-wave.test.mjs:337`).
- Run the pipeline twice in separate temp dirs and assert identical `sha256` of `analysis.json` and the wave export (EV-9). Keep a committed `golden.json` of expected hashes; a mismatch prints the regeneration command (same pattern as `export-wave --check`).
- Never touch real Ollama: set `fetchImpl` explicitly and assert it was called exactly N times and only with loopback or fake targets.
- Inject `freeBytes` into `memoryPreflight` (`L:weekly.mjs:632`) so a tight host does not defer the test.

Build order: EV-6, EV-11, EV-4/EV-5 (pure functions, 1-2 hours each); then EV-8, EV-10; then the full pipeline (about 1 day, reusing `T:helpers.mjs`).

## 5. Artifact inconsistencies found

1. `research/model-runs/README.md:253-254` says the model-runs tests are not wired into `site/package.json`'s `test` chain. `site/package.json:31` includes `test:model-runs`, so the README is stale.
2. The runbook says to run only `node site/scripts/test-model-runs.mjs` (`.claude/commands/weekly-model-wave.md:20`) but its reference section points to a single file (`:92`). Neither is the full acceptance gate.
3. v2 §4 gate 1 requires the plan commit to be older than the first record; the code only requires clean and committed (`L:weekly.mjs:718`).
4. The runbook lists the judges as claude-fable, claude-opus, claude-sonnet (`:66`); the structural all-Claude panel (v2 R2) means every wave carries the shared-taste limit until a non-Claude judge exists.
