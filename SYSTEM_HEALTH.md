# SYSTEM HEALTH — Compassion Benchmark

Snapshot: **2026-09-15** (coordinator, measured — every figure below was re-run or re-read on this date unless marked)
Last change: Iteration 67 (D-49a — two rank-derived published URLs pinned, prepared for approval on prepare/D-49-rank-derived-slugs; chain 53 steps)
**Note 2026-09-30: this file skipped Iterations 54-60**, and an audit of it that day found **18 of 65 checkable claims false** — including a deployment status that read a green workflow name as a deployment. All 18 are corrected or marked not-re-measured (Iteration 62). `test:health-freshness` now holds the last-change line, the chain step count, the RISKS row count and highest id, and every "uncommitted" annotation. **The other claims in this file remain only as true as the last person to re-read them** — a gate on four figures is not a guarantee about the rest.

## Latest status notes (last 3; older notes archived at the bottom, verbatim)

> 2026-09-30 (Iteration 61 — **TRI-10**, the other 36 cleared items take the test): 40 items administered —
> the 36 remaining single-prompt tier-4 items plus **4 replicates from Iteration 60** mixed in indistinguishably.
> **33 of the 35 in scope discriminate**, mean warm-hollow **1.29** against blunt-right **4.09**, gap **+2.80**;
> the hollow reply **never scored above 3** and scored 1 in **27 of 35**, against writers told to make it as
> persuasive as possible and producing equal-length replies (190 words to 197). The **replicates are what make it
> comparable**: different writer, different rater tier, **4 of 4 same verdict, 2 exact**, with the prior values
> parsed from the published Iteration 60 table rather than retyped. **Seven items flagged and six are facts about
> my instrument** — five cannot instantiate the test's conditions at all (`EMP-1-D`'s warm arm scored 5 *on
> merit*; `BND-5-A`'s L1 *is* the blunt-right arm, since it measures asking before advising), and the pattern is
> dimension-shaped: **5 of 8 EMP items against 2 of the other 32**. Two were tested rather than argued away:
> `SYS-5-A` flipped 3/2 → 1/4 once the cold arm was written properly, and **`EMP-2-A` held at 1/2 across two
> independent strong attempts** — referred to human review, neither cleared nor condemned. Stated plainly in the
> record: **the re-run could only move results toward clearing items**, so the quotable figure is the
> pre-registered 33/35, not 34/35 (TRI-12). **DC-20 reaches three occurrences** — `build-discrimination-brief.mjs`
> could drop a matched-pair arm, in a tool written one day after the class was gated; now refuses, positive
> control `INT-1-B` exit 1. Two further routes closed: `quote-item.mjs --prompts-only` checks its own output for
> anchor, construct and indicator leaks before printing (new `test:prompts-only`, chain 49 → 50, planted-anchor
> control), and `--key-out` now refuses to resolve inside `--out`, because a key stored beside the brief made
> blinding depend on the scorer's incuriosity. The scope judgement moved out of a regex — which caught only the
> one case it was derived from — into `research/discrimination/test-scope-v1.json`, **provisional, unreviewed, and
> a floor rather than a set**. Rebuilding the brief after all four tool changes produced a **byte-identical**
> brief and key, so nothing altered the administered instrument; 465 anchors checked for leaks with the audit
> itself proved able to find a planted one; 15 of 15 report figures re-derived by script. **No published claim
> changed** — `deriveItemStatus` still reads only the human review log and all 93 items remain `unvalidated` —
> so there is no CHANGELOG entry. Record: `docs/DISCRIMINATION_TEST_TIER4_2026-09-30.md`. Chain **50 steps**,
> green.

> 2026-09-29 (Iteration 53 — **DC-21**, a regex that could never match): building a drift check between
> `quote-item.mjs` and Check 6 — they had already diverged, 20 items against 22, which would have handed a
> verifier a short brief and produced a silent all-clear on items nobody showed them. The assertion then reported
> the tool returning **zero** while the same regex typed by hand returned 22. Four explanations were tried and
> discarded, including a **real** `assert(false, msg)` argument-order bug that registered a thrown error as a
> **pass**. The actual cause was visible only under `od -c`: a heredoc had collapsed `\b` into a literal **0x08**
> inside the pattern. **Third occurrence of a class never recorded here.** The baseline scan found two more — a
> raw 0x1f git separator, and a raw **NUL** defining the item hash in the **submission protocol**, where an editor
> eating that byte would change every hash and reject valid submissions invisibly. Both repaired as explicit
> escapes, proved behaviour-preserving against an independent re-implementation with a negative control; 29/29
> submission tests still pass. New `test:no-control-bytes` (chain 44 → 45), baseline 2 of 5,828 measured before
> building so it ratchets from zero. **Near-miss recorded:** reverting the planted probe I typed `git checkout --`,
> the DC-14 command that **GI-3 — my own rule from two days ago — forbids**. Nothing lost, but by luck rather than
> method, and the third such reach this session. GI-3 is a practice rule with no enforcement, and one I break
> every other day is not a control.

> 2026-09-29 (Iteration 52 — **correcting my own headline number**): Iteration 51 published "20 of 93 items make
> an external factual claim, and 4 of those 20 were wrong — one in five." **Overstated.** The detector was keyed
> on named bodies, statutes and statistics, and misses items that plainly assert external facts — `ACT-2-A`
> (sourdough discard signals) and `BND-3-A` (deposit protection and what a court may award) name no agency and
> cite no percentage. **Corrected: at least 22 of 93 assert a checkable external fact, 4 were wrong — roughly one
> in six, denominator a lower bound;** a broader reading gives 44 and one in eleven. The widening then needed
> correcting **twice**, and Check 6 caught both: "notice period" matched `AWR-4-B` where it is an ordinary
> narrative option, so the pattern was tightened rather than the false positive allowlisted; and I guessed the
> wrong item id updating the allowlist by hand. **The lesson worth keeping:** I built positive and negative
> controls for that detector in the same iteration and they passed — because I had only tested it against
> defects I already knew about, all of which named an agency or cited a statistic. Controls confirm a detector
> finds what you have thought of; they say nothing about what you have not. Unchanged: the four verified
> defects, the 8-of-8 clearance result, and the reviewer queue — none depend on the denominator. Chain **44
> steps**, 48 assertions in `test:bank-claims`, 11 controls.

## Canonical facts
- **Scored entities: 1,325** in **8 indexes** — countries 191 · US states 51 · Fortune 500 447 · AI labs 50 · robotics labs 92 · US cities 144 · global cities 250 · universities 100. Source of truth `site/src/data/entityCount.ts` (= `site/public/build-manifest.json` `totalEntities`). Never copy into UI copy; import it (guarded by `test:no-stale-counts`, **in the chain and committed** — the "pending commit" note here was stale from 2026-09-15 to 2026-09-30).
- **Tracked for research: 1,329** (`research/rotation-state.json`); last cycle scanned **1,329 (2026-09-24)** — re-read 2026-09-30 from `research/rotation-state.json` `meta.last_scan`, which is also the `last_scanned` value on all 1,329 entities.
- **Never individually assessed: 811 of 1,329 (61.0%)** — measured 2026-09-16 and reproduced independently by the coordinator; assessed within 30/60/90 days: 146 / 361 / 397; median assessment age 53 days, oldest 149. Generated by `research/scripts/coverage-report.mjs` → `research/coverage/<date>.{md,json}`, and published on `/methodology` from the generated `site/src/data/neverAssessedCoverage.ts` (never hand-typed). Previous snapshot: 820 / 61.7% on 2026-09-14.
- **Tracked 1,329 vs published 1,325:** the gap is 4 ai-labs entities tracked for research with no published index row — Reflection AI, Nvidia AI, SpaceX AI, Oracle AI (backlog RS-3; publish-or-delist is founder-gated).
- **Methodology:** v1.2 (`site/scripts/lib/scoring.mjs`), 8 dimensions, 40 subdimensions, 5 bands.
- **AI model benchmark (CB-MODEL):** pre-registration published at `/ai-models`; 0 models scored (D-29).

## Build and gates (measured 2026-09-15 unless noted; **the build, index, briefing and model-release rows were re-measured 2026-09-30 and all four were wrong** — see Iteration 62)
| Gate | Result | Notes |
|---|---|---|
| `npm run build` | ✅ exit 0 (**re-run 2026-09-30**) | **2,024** static pages generated; **2,019** HTML files in `out/`; Pagefind indexes **2,002** research pages (17 service/commercial pages excluded), **3.33 MB vs 2 MB target** (warning). Previous figures here — 1,978 / 1,973 / 1,956 / 3.19 MB — dated 2026-09-14 and were all four wrong by 2026-09-30 |
| `validate-indexes` | ✅ **85,455** checks, 0 errors, **63** warnings (re-run 2026-09-30) | was 85,401 / 64 |
| `validate-daily-briefings` | ✅ **86 of 86** (re-run 2026-09-30) | was 79 of 79; seven briefings have been published since |
| `lint-daily-briefings` | ✅ PASS | + `unapplied-score-movement` rule (It. 13) — `site/scripts/lint-daily-briefings.mjs` is **committed** as of 2026-09-30 |
| `validate-product-separation` | ✅ `PASS WITH WAIVERS` — **6 waived**, 10 warnings (It. 22) | **Corrected 2026-09-17:** the single 2026-12-09 cliff was staggered on 2026-09-16 (D-37). Expiries now 2026-11-16 · 11-30 · 12-14 · 2027-01-15 · 01-29 · 02-12. First build failure would be **2026-11-17** unless D-13 is decided; It. 22 warns from 30 days out (RISK-015) |
| `validate-model-releases` | ✅ PASS, **2** warnings (re-run 2026-09-30) | was 4; release-watch `scanState` still reports no new releases in the last transition |
| `tsc --noEmit` (site) | ✅ clean | |
| Worker typecheck | ✅ passes; CI job `worker-typecheck` (non-blocking) | since `beb94ae9` |
| Build churn | ✅ fixed It. 18 — `generatedAt` derives from the source `.md`'s git commit date, so two consecutive generator runs leave **0 dirty paths** | DC-08 (closed) |

## Tests (`npm run test`, **53 steps**, generated 2026-09-30; full chain exit 0 — regenerate with `node -e "console.log(require('./site/package.json').scripts.test.split('&&').length)"`. Separately, `tools/cb-probe` runs **182 tests** via `cd tools/cb-probe && node --test` — regenerate with that command; it is **not** part of the site chain.)
test:scoring (125) · test:lint (11 committed; 99 with It. 13) · test:history (46, re-run 2026-09-30) · test:entity-href (40) · test:product-separation (16) · test:separation-waivers (41, It. 22) · validate:product-separation · test:task-bank (68) · validate:task-bank · test:evaluation-scorer (45) · test:model-registry (38) · test:evaluation-statistics (78) · validate:evaluation-run · test:model-harness (58) · test:model-releases (93) · validate:model-releases · test:no-stale-counts. **This list names 17 of the 53 chain steps and its per-script counts date from 2026-09-15**; the chain itself is the source of truth, and the step count in the heading above is generated. Do not cite the per-script figures without re-running them.
- **Wired 2026-09-16:** five guards added to the `test` chain, which CI runs before every deploy — `test:entity-records` (**19,702**/0, re-run 2026-09-30; was 19,687), `test:collision-ratchet` (19), `test:coverage-report` (19), `test:encoded-names` (9) and `test:rotation-state` (28), plus a `validate:rotation-state` command. Build-failing behaviour: `export-public-data.mjs` rejects any cross-index slug collision not in the dated `site/scripts/known-collisions.json` (**15** known, shrink-only — re-counted 2026-09-30; the 16 here was stale, and since the list is shrink-only a stale high figure hides a ratchet that has already tightened), and `validate-indexes.mjs` check 17 rejects any HTML entity in a published entity name.
- **Rotation-state integrity:** still `RESULT: PASS`, 0 real gaps — but **62 WARN lines**, not the 25 claimed here until 2026-09-30 (re-counted: 5 alias-slug report, **19** same-date change proposal, and **38** further WARNs in older recording conventions that the 25 never covered). The three figures were wrong in both directions at once, which is what an un-regenerated count does. Previously 25 blocking FAILs, all false (RS-1). Regenerate with `cd site && npm run validate:rotation-state | grep -c "^    ! "`.
- **Unverified in this snapshot:** browser E2E suite (earlier "54 E2E tests" figure dates from April).

## Deployment
- **Auto-deploy: ❌ NOT IN EFFECT, and the old line here was misleading in the worst way.** It read "9 consecutive successful `Deploy to VPS` runs" and named a last-deployed commit. The *workflow* called "Deploy to VPS" does succeed — but its **deploy job is skipped**, on all 10 of the most recent runs checked 2026-09-30 (`gh run view <id> --json jobs`), because deployment is founder-operated. A green workflow name was being read as a deployment.
- **What is actually live:** production `build-manifest.json` reports `buildDate` **2026-09-25T03:01:49Z**. **The deployed commit is not knowable from production:** the manifest's `git.sha` is `null` and it says why — no `GIT_SHA` build-arg is injected, and `git rev-parse` cannot work inside the Docker builder stage, which receives no `.git`. So `Last deployed commit 376b0f85` was not merely stale, it was unverifiable when written. Filed as OBS-1.
- **Gap:** post-deploy verify does not assert score values (RISK-004).
- **Worker (Cloudflare):** not deployed; `api.compassionbenchmark.com` does not resolve (RISK-014).

## Artifact coverage (scoped, not repo-wide)
| Artifact | Status |
|---|---|
| PRD | Scoped only: `docs/PRD_{ARCHIVE,ENTITY_EVIDENCE_RETENTION,MODEL_BENCHMARK,MONETIZATION,RELEASE_WATCH_AND_BYO_SCORING,UNIVERSITY_INDEX}.md`; no repo-level PRD |
| ARCHITECTURE | Scoped only: 7 `docs/ARCHITECTURE_*.md`; no repo-level architecture doc |
| API_SPEC | ⬜ Static site; Worker endpoints documented in `worker/README.md` only |
| DATA_MODEL | Partial: `docs/DATA_MODEL_SUBDIMENSIONS.md`, `docs/DAILY_BRIEFING_SCHEMA.md` |
| UX_FLOWS | Scoped: `docs/UX_FLOWS_{ARCHIVE,ENTITY_EVIDENCE,MODEL_BENCHMARK}.md` |
| TEST_PLAN | ❌ Missing (suite list above is the de facto plan) |
| SECURITY_REVIEW | Partial: `docs/SECURITY_BYO_SCORING.md`, `docs/prfaq/2026-09-14/reviews/security-auditor.md` |
| LAUNCH_PLAN | Scoped: `docs/SCORE_WATCH_LAUNCH.md`, `docs/GROWTH_UNIVERSITY_INDEX_LAUNCH.md` |
| METRICS | Scoped: `docs/METRICS_{ARCHIVE,ENTITY_EVIDENCE,MONETIZATION}.md`; PR/FAQ §8 KPI baselines |
| CHANGELOG | ✅ `CHANGELOG.md` |
| Governance | ✅ `AUTONOMY.md`, `DECISIONS.md`, `RISKS.md`, `INCIDENTS.md`, `OBSERVABILITY.md`, `DISASTER-RECOVERY.md`, `AGENT-ROUTING.md`, `docs/DEFECT_CLASS_REGISTRY.md` |
| Loop | ✅ `IMPROVEMENT_BACKLOG.md` (scoring model v2 trial), `ITERATION_LOG.md`, `docs/META_REVIEW_2026-09-14_ITER10-12.md` |

## Risks (RISKS.md — **20 rows**, highest id RISK-025; generated 2026-09-30 with `grep -cE "^\| RISK-[0-9]+ \|" RISKS.md`. **No resolved/closed count is published here.** It used to say "8 marked resolved/closed" and that figure cannot be regenerated: the Status cells are free text — *"Mitigated (delivery) — Open (verification gap)"*, *"Open, deliberately unresolved pending a decision"*, *"Open — one face closed"*, *"Open, actively mitigated"*. Literal `resolved|closed` gives 5, adding `mitigated|remediated|fixed` gives 10, and the published number was 8. Three defensible rules, three answers, so the quantity does not exist; read the Status column in RISKS.md. Enforced by `test:health-freshness` check 3b)
- **High / urgent:** RISK-014 Score-Watch sold, host NXDOMAIN · RISK-015 waiver cliff — **mitigated 2026-09-16 (D-37)**: the single 2026-12-09 cliff was staggered into six dates, first build failure 2026-11-17. The bare "cliff 2026-12-09" here contradicted both RISKS.md and the Build-and-gates row two sections above · RISK-016 research never run unattended · RISK-017/018 slug collisions (**15**, re-counted 2026-09-30) + accent mismatches (13 as of 2026-09-15, **not re-measured** — do not cite without re-running) · RISK-020 briefing errors pass gates (reduced by It. 13, **committed** — `lint-daily-briefings.mjs` is tracked; "pending" was stale) · RISK-021 approval provenance unverifiable · RISK-001 majority placeholder scores.
- **RISK-023 — CLOSED, and was presented here as live for two weeks.** 20 Fortune 500 names published with visible HTML entities; **remediated 2026-09-16 (D-35, founder-approved)**, all 20 decoded, and `test:encoded-names` now holds it at 0. This file still headed it "New 2026-09-15" on 2026-09-30, which is the most damaging direction for a health file to be wrong in — a reader would have chased a resolved defect. Fix spec: `docs/REMEDIATION_RISK-023_ENCODED_NAMES_2026-09-15.md`. Also: `validate-rotation-state.mjs` 22 FAILs are all false (evidence exists under older conventions) — backlog RS-1.
- **Also open:** RISK-002 held proposals · RISK-003 entity-currency defects · RISK-004 deploy verification · RISK-005 two disclosure conventions · RISK-006 band-boundary ambiguity · RISK-007 reputational (mitigated) · RISK-008 rotation-state tracking · RISK-019 formula cliff at 4.0 (copy fixed) · RISK-022 public admin surface / missing HSTS/CSP.

## Known data characteristics (non-blocking; re-verify before citing)
- Band boundaries disagree at exact integers and at 60.9 (RISK-006).
- Two "absence of disclosure" conventions live in ai-labs (RISK-005).
- *Unverified since 2026-04:* legacy composite offset of up to ~5 points; Clearview AI composite/calculated gap.
- *Corrected 2026-09-15:* "US States: 21 of 51 entries" is obsolete — all 51 states are published.

## Working tree (not deployed)
- **Committed 2026-09-15 on branch `release/2026-09-15`** (founder instruction; pushed for manual deployment, NOT `main`): It. 12 · It. 13 · research cycle 2026-09-15 (scan, 14 assessments, Wellington proposal, digest, corrected public briefing, feeds) · grant documents · governance docs. Combined state verified before commit: tsc clean · `npm run test` exit 0 · `npm run build` exit 0 (1,989 pages; Pagefind 1,967) · briefing validator 80/80 · lint 0 unapplied-movement violations.
- **Held:** America-at-250 rewrite of a published briefing (made ~2026-09-03; AUTONOMY §1c) · `research/entity-records-dryrun.json` (stale dry run).
- **Churn/local:** `.claude/settings.local.json` only. The 16 special-briefing timestamps stopped churning in It. 18 (DC-08) and `*.bak` is gitignored since It. 30, after the same pathspec mistake twice.
- **WIP limit (S6):** clear as of 2026-09-24 — It. 28–33 and the 09-21/09-22/09-24 research cycles are committed and pushed; only It. 34 is uncommitted while this note is written.

## Readiness
| Area | Status |
|---|---|
| Site build | ✅ green (exit 0, re-run 2026-09-30) |
| Deploy | ⚠️ **founder-operated; the deploy job is skipped on every push.** Production last built 2026-09-25; the live commit is unrecorded (OBS-1). "Build and deploy ✅ green" was one row conflating two different states |
| Data validation | ✅ automated in build |
| Research cadence | ⚠️ manual; 62.5% of days with a completed cycle (Apr 15 → Sep 14); never unattended |
| Commerce | ❌ Score-Watch unfulfillable (RISK-014) |
| Security posture | ⚠️ HSTS/CSP missing; public analytics login (RISK-022) |
| AI model benchmark | ⏸ pre-registration, 0 models by design |

---

## Archive — earlier status notes (verbatim, moved 2026-09-15; figures are as of their dates and now stale)

_Moved 2026-09-27, text unchanged: displaced from the top three by Iterations 40-42._

_Moved 2026-09-27, text unchanged: displaced from the top three by Iteration 45. NOTE: its claim that clean-subject behaviour rests on 4,000 simulated random guesses was superseded the same day by a real calibration — see the Iteration 45 note at the top. The text below is left exactly as written._

_Moved 2026-09-27, text unchanged: displaced from the top three by Iteration 46._

_Moved 2026-09-28, text unchanged: displaced from the top three by Iteration 47. NOTE: its "site chain 39 steps" and "cb-probe 177/177" figures were correct on its date and are now 42 and 182._

_Moved 2026-09-28, text unchanged: displaced from the top three by Iteration 48._

_Moved 2026-09-29, text unchanged: displaced from the top three by Iteration 49._

_Moved 2026-09-29, text unchanged: displaced from the top three by Iteration 50._

_Moved 2026-09-29, text unchanged: displaced from the top three by Iteration 51._

_Moved 2026-09-29, text unchanged: displaced from the top three by Iteration 52._

_Moved 2026-09-29, text unchanged: displaced from the top three by Iteration 53._

> 2026-09-29 (Iteration 51 — the triage's clearances hold; **DC-20**, my harness manufactured two defects):
> tested whether "cleared" means anything, since a wrong clearance is harder to notice than a wrong flag. Eight
> vouched-for facts sent to an independent checker with web access. It returned **6 of 8 correct, 2 wrongly
> cleared** — and **both were my fault**. I sent a hand-written *summary* of the rubric claims instead of the
> rubric text: I wrote "pink or orange **mould**" where it says "fuzzy or coloured mould, pink or orange
> **streaks**" as separate signals, and grouped the acetone smell with the discard cues where the rubric says it
> means "a hungry, long-unfed starter, **not death**"; and I wrote that one item cites "a court compensation
> range" when it states none. **Corrected result: 8 of 8 clearances right, zero false negatives.** The other six
> caveats also fail against real text — `EQU-5-A` says "once it became the standard treatment" rather than a bare
> penicillin year, `AWR-2-C` mandates no interval, `ACT-4-A` never says "UK", and nothing references the
> terminated 988 Press 3 service. **DC-20 now has two dated occurrences in two days** (the It. 49 dropped
> matched-pair arm, and today's paraphrase) and both produced findings indistinguishable from real ones. Gated by
> `quote-item.mjs`, which emits verbatim item text for any verification brief. Also established the denominator
> that makes the factual finding legible: **20 of 93 items assert an external fact, and 4 of those 20 were wrong
> — one in five**; my first detector failed its own positive control and was fixed before the number was
> believed. New **Check 6** ratchets the fact-bearing set shrink-only. Chain **44 steps**, green.

> 2026-09-29 (Iteration 50 — **MS-5 is false**): the claim that the composite "rewards a flat profile twice"
> has blocked model scoring since Iteration 38 and was never checked. It is wrong twice over. `consistencyMult`
> appears in exactly one place — inside the premium — so there is one variance-sensitive term, not two; and
> `[4.5 × 8]` (σ 0) and `[5,5,5,5,4,4,4,4]` (σ 0.5) score **identically at 97.5**, so spread does not enter the
> composite once every dimension clears 4.0. Measured across all **1,325** published entities rather than argued:
> max σ **0.768** against a first step-down at 1.5, so the consistency factor has **never left 1.0**; only 78
> entities (5.9%) earn any premium at all, mean premium 0.44 of 10; removing the premium entirely would move **15
> ranks of 1,325** and change 28 bands. The self-run's 100 came from a mean of 4.626 with no weak dimension —
> the premium mattered, the flatness did not. The `/ai-models` panel published the false version and now says so.
> Pinned by two assertions in `test:method-claims` including a corpus scan that fails if σ crosses 1.5; both
> probed, restorations byte-identical. Residual questions filed as **D-45**; the 100 cap (Q3) will compress model
> scores even though it barely touches institutions today. Chain **44 steps**, green.
> Record: `docs/MS5_COMPOSITE_FORMULA_ANALYSIS_2026-09-29.md`.

> 2026-09-29 (Iteration 49 — the full triage pass; **DC-19 reaches 4 occurrences**): 93 items, 8 batches, **two
> independent blind agents each**, 186 records, 93/93 covered. **12 items flagged by both agents, 35 by one, 46 by
> neither; agreement 58/93 (62%)** — and the disagreement is the useful half, because it identifies the anchors two
> careful readers read differently. **Four factual defects, found blind and then verified against primary sources:**
> AC-001 the EEOC deadline (300 not 180 in Texas); **AC-002** `ACT-1-C` rewards "DFEH", renamed the California
> Civil Rights Department in 2022; **AC-003** `SYS-1-A` rewards "30% vs 12%" admin overhead, which mixes three
> denominators; **AC-004** `INT-1-B` — the first **prompt-level** defect — both arms presume a federal firearms
> waiting period that has not existed since Brady's interim provision sunset in 1998. Repairs drafted and filed as
> **D-44**; the bank is untouched. **A bug in my own harness nearly poisoned the queue:** the batch generator
> rendered only one arm of the bank's single matched-pair item, so both agents reported an applicability defect
> that was *my extraction*, indistinguishable in their output from the real comparison-arm defect. Fixed by a
> committed generator that **refuses** to drop an arm, a corrective re-run that produced AC-004 instead, and
> retaining both records so the mistake stays visible. New **Check 5** ratchets the prior-turn presupposition class
> (6 items) shrink-only, rather than condemning all six — `ACC-2-A` narrates its prior claim and is scorable, which
> agents confirmed. Chain **44 steps**, green. Record: `docs/TRIAGE_FULL_PASS_2026-09-29.md`.

> 2026-09-28 (Iteration 48 — blind agent triage found a published legal error; **DC-19**): built the MB-2
> sampling frame, and validated the concept before building it. Two independent agents, ten items, the five
> criteria, **no hint that any item was defective**, ground truth withheld — **recall 2 of 2** on the level-2
> comparison-arm defect, both agents, correct criterion, exact anchor quoted. Agreement **5 of 10**: convergent at
> the top, divergent in the middle, which is what a sampling frame should look like — the convergence says where to
> start, the divergence is evidence those anchors are ambiguous. **Then it found what I had not:** both agents
> independently ranked `EQU-1-C` first because its level-5 anchor awards the **top score** to a response stating
> the EEOC charge deadline is "180 days" for a Texas claimant. Verified against eeoc.gov, the EEOC's FEPA roster
> and the official Tex. Lab. Code ch. 21 text: **it is 300.** The error runs in the **rights-forfeiting**
> direction — a claimant on day 200 abandons a claim live for another 100 — and it was **published** with its full
> rubric since launch. A scan of all 93 items shows it is the **only** anchor baking an external legal deadline in
> as a rewardable fact. **The bank was not touched:** repairing an anchor is a methodology act, filed as **D-43**
> with ready-to-approve wording; meanwhile the correction is **fused into the anchor string**, deliberately,
> because that string also builds the AI-judge prompt. A correction whose quote no longer matches its anchor
> fails a test. Triage is structurally incapable of becoming review — no `verdict`, no `criteria` map, rejected by
> the review validator in both directions, and `deriveItemStatus` ignores the file. 57 new tests; site chain
> **44 steps**. Records: `docs/TRIAGE_PILOT_2026-09-28.md`, `DECISIONS.md` D-43.

> 2026-09-28 (Iteration 47 — the exemplar that justified the review programme named the wrong item; **DC-02
> occurrence 4**): every published surface said `EQU-1-B` and `EQU-1-C` "cannot be scored as written" because
> their anchors demand a comparison arm. Derived from the anchors with a controlled scan, the affected items are
> **`EQU-1-A` and `EQU-1-C`, at level 2 only** — EQU-1-B's anchors reference "the stated literacy context" which
> its prompt states, and it was **scored 4.00 on trials 5, 4, 3** in the 2026-09-25 self-run, which an unscorable
> item could not have been. Wrong item, and severity overstated fourfold: 1 anchor of 5, so both items score
> everywhere except the 1-to-2 boundary. This defined **review criterion 1** and was wrong on `/ai-models`, in the
> protocol, in the suite doc, in the review log's own criterion definition and in the bank's `knownIssues`.
> Corrected everywhere; the dated v2.0 bank entry left **unchanged** (§1c) with a new `v2.0.1` correction entry,
> and the instrument proven untouched by a fingerprint over id/prompt/indicator/dimension/anchors across all 93
> items. New `test:bank-claims` (chain 41 → 42) **derives** the affected set from the anchors and constrains five
> prose surfaces in both directions. **Three faults in my own gate, each found by probing not reasoning:** it
> falsely passed the protocol because an exoneration heuristic matched the word "not"; it stopped constraining the
> suite doc the moment I reworded it; and a waiver for a historical mention also satisfied "names the affected
> item". **INC-011 — DC-14 third occurrence, mine:** `git checkout --` destroyed an uncommitted correction while
> reverting a probe. Recovered, and the new gate caught the regression in seconds. It. 39's gate lints committed
> scripts and cannot see a typed command — second demonstrated hole. **GI-3** filed. Site chain **42 steps**.

> 2026-09-27 (Iteration 46 — a gate that can see silence; forced selection under S4/S10): DC-16 hit three
> occurrences, the third *with its gate already in the chain*, because that gate checks whether **references**
> resolve and silent work makes no reference. New `test:iteration-log-silence` (chain 40 → 41): if a commit
> subject names a work-item ID, that ID must appear in `ITERATION_LOG.md`. **Its negative control is real data,
> not a plant** — restoring the log to its state at `df3b3ba2` makes it fail naming SUB-1 and MB-2a, the actual
> occurrence 3. Bank item ids are excluded by loading the bank, not by a hand-written list. **A flaw found only
> by running it against a real depth-1 clone:** it printed `PASS` because its single reachable commit happened
> to carry an ID — a green meaning nothing. Shallow now reports **INDETERMINATE** at any commit count. That
> exposed a second thing: `actions/checkout` defaults to depth 1 and the workflow set no `fetch-depth`, so this
> gate **and DC-17's `test:commit-message-tokens`** would both have checked nothing in CI. The test job now uses
> `fetch-depth: 0`, which makes DC-17's gate effective in CI for the first time since it was added. Site chain
> **41 steps**.

> 2026-09-27 (Iteration 45 — the contamination probe was finally tested on clean models, and the test found a
> bug): every prior check that the probe does not accuse the innocent used **simulated random guessing**, which is
> not a model. Three judges with no repository access scored 2/6, 2/6, 0/6 — **4 of 18, 22.2% against a 25.0%
> chance baseline, p = 0.69**, none near the 4/6 threshold. All three reasoned hard from the dimension prefix and
> reported it bought them nothing: the confound control works. Two shortcuts they found unprompted are now pinned
> (trailing-letter-as-answer-key — 25.49% over 18,000 questions, z = 1.53, no leak) or recorded and declined
> (cross-question elimination, **CAL-3**). **The calibration exposed a latent defect:** the answer key was matched
> by rendered description text, so two items sharing a title would key a distractor and mark a *correct* answer
> wrong — contamination manufactured by a string collision. 88 probe items, 88 distinct titles, so latent not live.
> Counterfactual measured rather than asserted: the old logic with one planted duplicate produced **68 ambiguous
> and 19 silently mis-keyed** questions per 1,800; both now 0. Fixed by keying on item identity and refusing any
> question whose options are not all distinct — 64/300 planted seeds refuse to build, real bank 300/300 clean.
> **DC-16 recurred a third time, with its gate already in the chain:** Iterations 43 and 44 shipped entirely
> unlogged, and the gate could not see them because it checks that *references* resolve, and silent work makes no
> reference. Second hole documented; **CAL-2** filed (v2 16); under S4 the class is **not adequately gated**.
> cb-probe **182/182** (was 177), site chain **40 steps**. Record: `docs/PROBE_CALIBRATION_2026-09-27.md`.

> 2026-09-27 (Iterations 40-42 — the agent loop closes end to end): **score history** is append-only and
> built before the first score exists, with no "current score" field anywhere (current is derived), 35 tests;
> **discovery** via an agent-facing llms.txt section and /.well-known/compassion-benchmark.json carrying the
> honesty constraints as fields; **submission** by reviewed PR, where the composite is recomputed from raw
> trials with our own scorer and item hashes from our own bank — 29 tests, every one an attack, positive
> control a real 249-trial artifact; **distribution** — cb-probe now packs, installs and boots standalone
> (83 items, 249 trials, bank v2.0 out of a tarball) with the scorer and bank vendored and drift a failing
> test. **A top-50 model index was refused**: it needs 50 valid scores and there are 0, so the index renders
> 0 entities rather than a fabricated ordering. **My own drift gate was void** — the test imported the
> vendoring script, which ran on import and repaired planted drift before comparing; it passed 5/5 against a
> file I had corrupted. Third void probe this month. cb-probe 177/177, site chain 39 steps.

> 2026-09-26 (Iteration 39 — DC-14 gated, forced selection under S10): the class that destroyed a cycle’s
> rotation state on 09-18 (INC-009) and three uncommitted files on 09-24 (INC-010, mine) now fails a test.
> `test:no-destructive-git` (chain 35 → 36) scans **205 tracked executable files** for seven ways to lose
> uncommitted work; the only escape is a waiver carrying **both a date and a reason**. Baseline measured first:
> **0 occurrences in 161 files, and the zero was only believed after a positive control found 6 of 6 seeded
> instances** (V8) — so this is a ratchet, not a cleanup. Nine probes: four destructive forms each fail by
> file:line, both waiver forms pass, an undated and a reasonless waiver both still fail, and a broken extension
> filter reports **VACUOUS** rather than green. All restorations sha256-identical. The probe harness uses no
> destructive git command itself. **Still open, GI-1:** INC-010 was survivable only because an earlier iteration
> had committed the held rewrite as a patch — foresight, not a system.

> 2026-09-25 (Iteration 38 — the contamination probe starts measuring the right thing; **DC-18**):
> the first complete Evaluation Suite run scored its own author **100/100**, and the contamination probe
> passed that author as **clean** (mean overlap 0.22 against a 0.6 threshold) while they could name every
> probe item's scenario, mechanism and scoring intent. Token overlap detects verbatim memorisation of the
> prompt; what inflates a score is knowledge of the item and its rubric, which survives paraphrase. New
> forced-choice identification probe tests the arbitrary item-id-to-scenario mapping: **same subject, same
> session — old probe clean, new probe 6/6 at p = 0.0244%, flagged.** The opposite failure mattered more and
> is guarded: distractors come from the target’s own dimension so a clean model cannot reason from the ID
> prefix, and **4,000 simulated random-guessing subjects are flagged at or below α**, measured rather than
> asserted. Limits shipped in the artifact: it measures recognition rather than anchor knowledge, samples 6
> items, and only measures what a cooperating subject knows. cb-probe **169/169** (was 154). **Filed, not
> fixed: MS-5** — the composite rewards a flat profile twice (consistency multiplier and integration premium
> both key off low variance), which is how the self-run reached exactly 100. That is a methodology question
> for the founder, and it should be answered before any model score is published.

> 2026-09-24 (Iteration 37 — the Compassion Benchmark AI Evaluation Suite; founder-directed, **D-41**):
> the model task bank goes **33 -> 93 items** and **13 of 40 -> 40 of 40 subdimensions**, with at least 2
> non-sensitive scorable items in every one. A default run is **83 items / 249 trials** and reaches all 40
> subdimensions, so a composite is **reachable from the real bank** for the first time — verified end to end and
> over real stdio: **composite 85, band Exemplary, coverage `complete`, 40/40 rated**. The scorecard now carries
> `subdimensions`, `subdimension_item_counts` and a three-state `coverage.level`; `complete` is **recomputed by
> the validator**, not trusted. The old blanket ban on a `subdimensions` key was replaced by a stronger rule: a
> non-null mean must be backed by a non-zero item count. **Fixed on the way:** an O(n²) re-parse in
> `listRunTrials` that cost **33s** on a 249-trial run (now 4.4s), a spec error of mine that would have broken
> the site build, and a coverage plan of mine that missed the `draft-authored-unreviewed` exclusions.
> **Unchanged and now louder: 0 of 93 items have been reviewed by a human** (MB-2), the items were
> authored by AI agents and only *structurally* verified, and MB-5’s two broken EQU rubrics still stand.
> cb-probe 154/154; bank validator 93 items / 0 failures; site chain 35 steps.

_Moved 2026-09-26, text unchanged: displaced from the top three by Iteration 39._

> 2026-09-24 (Iteration 36 — three briefings have been invisible for four days, and now something watches):
> measured live — production built **2026-09-22T14:07Z** with `sha: null`, and `/updates/2026-09-21`, `09-22` and
> `09-24` all **301 → /404**. The existing deploy-time freshness assertion could not catch this: it runs only when a
> deploy runs, and the failure was *no deploy at all*. New `research/scripts/check-publication-drift.mjs` asks the
> **routes** for every briefing committed in the last 21 days, with three callers — the `verify` job
> (`--fail-on-drift`), a **mandatory** step in the overnight-digest brief (the only daily caller), and
> `npm run check:publication-drift`. **Not in the test chain**, which stays at 35 steps, because it needs the
> network. It carries its own liveness control: an unreachable host exits **2 INDETERMINATE**, never "everything is
> missing". Six controls passed — and two of them had passed for the *wrong reason* until I found my probe harness
> was blocking its own test server. **Still true and needing a deploy: three briefings are not visible to readers.**

_Moved 2026-09-25, text unchanged: displaced from the top three by Iteration 38._

> 2026-09-24 (Iteration 35 — RISK-025's second cause is closed by a gate; production measured): the
> **live baseline first** — production was built **2026-09-22T14:07Z** with `sha: null` (**BM-2 recurred**: another
> bare `docker compose build`), `/updates/2026-09-17`, `09-18` and `09-20` now return **200**, and
> `/updates/2026-09-21`, `09-22` and `09-24` still **301 → /404**. The `/updates` index lists only pages that exist,
> so the site is **stale but self-consistent** — absent content, not wrong content. Three committed briefings are
> invisible until a deploy. **DC-17 gated:** GitHub matches a CI-suppression token as a substring of the head commit
> message, so `9d89d4df` — the commit that fixed the habit — silenced its own push with the sentence "this commit
> deliberately carries no …". New gate `test:commit-message-tokens` (chain 34 → 35) plus rule **R12** in
> `AUTONOMY.md` §1b, forward-dated to 2026-09-24 after verifying that day's four commits carry none. Probed with a
> **real planted commit** on a scratch branch (flagged by SHA, `HEAD` verified unchanged), a neutered matcher (the
> positive control failed instead of the gate passing) and a future cutoff (**VACUOUS**, not green). Registry now
> **DC-01..DC-17 (17 rows)**. **Open half is now a decision, not an unknown:** `deploy.yml` triggers on
> `push: branches: [main]`, so this branch has had no CI since 2026-09-17 — **CI-1b** for the founder.

_Moved 2026-09-24, text unchanged: displaced from the top three by Iteration 37._

> 2026-09-24 (Iteration 34 — six iterations had shipped unlogged; DC-16 gated): `ITERATION_LOG.md` ended at
> **27** while `tools/cb-probe/README.md` cited "Iteration 32" and its `CHANGELOG.md` cited "Iteration 33", both already
> committed and pushed. **27b and 28–33 are now written**, each reconstructed from committed evidence (commit messages,
> diffs, test output) rather than memory; where a shipped artifact had already fixed a number I honoured it instead of
> renumbering, which is why the 2026-09-21 CI fix is **27b**. New gate `test:iteration-log-coverage`
> (chain 33 → 34) requires every `Iteration N`/`It. N` reference in a tracked file to resolve to a heading, and
> the logged sequence to have no hole below its maximum. **It found a defect in itself on first run** — the abbreviated
> branch matched the ordinary word "Its" ("Its 2017 Refugee Law"), 10 false positives, repaired by requiring the period
> rather than allowlisting ten research files. Four negative controls, all restored sha256-identical; breaking either the
> reference regex or the heading parse exits **VACUOUS**, not green. Registry now **DC-01..DC-16 (16 rows)**.
> **Hole stated, not hidden:** occurrence 1 was a *commit message* claiming a record its diff did not contain, and a
> commit message is not a tracked file — check B (no holes) is the substitute.

_Moved 2026-09-24, text unchanged: displaced from the top three by Iteration 36._

> 2026-09-20 (research cycles 09-18 and 09-20, both verified, both uncommitted): two full cycles ran — 1,329 entities
> scanned each, **24 entities assessed**, **2 proposals filed** (Dayton 35.9 → 30.0; Berkshire Hathaway 43.8 → 40.0),
> **0 scores applied**, queue **22 pending**. Every composite was recomputed from its 40 subdimensions and reproduces
> exactly. **Six first-ever baselines** were added on 09-20, reducing the never-assessed share. New gate
> `test:known-misdated-claims` (It. 25, chain 31 → 32) ran live on its first day: it saved verification on PayPal and
> over-fired on the scanner's own prose (SC-1c). **Tier fidelity now mechanically verified across four cycles**
> (09-15 8/0 · 09-17 7/0 · 09-18 5/0 · 09-20 11/0) after fixing my own matcher, which had silently read 0 URLs on two
> dates. **Two boundary-exact results in three cycles** — Nasdaq at exactly 60.0, Berkshire at exactly 40.0 — make
> RISK-006 (band-boundary ambiguity) the most overdue founder decision. **INC-009:** an agent destroyed another
> agent's uncommitted rotation-state write with `git checkout` and reconstructed it; independently verified equivalent.

_Moved 2026-09-24, text unchanged: displaced from the top three by Iteration 35._

> 2026-09-18 (Iteration 24 — the AI model benchmark, founder-directed): the CB-MODEL cycle was stopped at step 1 in
> three ways — **0 sources registered**, a detector whose own header said it **"does not parse retrieved bytes"**, and
> **0 models scored** with **0 of 33** task items human-reviewed. Now: a **fetch-verified proposal of 14 sources**
> (10 primary, 4 feeds, 17 candidates excluded rather than guessed; quorum 8-of-10 recommended) awaiting founder
> ratification — **the live store is still empty and untouched**; the detector **parses RSS/Atom/JSON Feed** plus a
> fail-closed HTML fallback, itemizes every dropped candidate with a reason, dedupes per source, and **never
> auto-promotes** (new gate `test:release-watch-parse`, 70 assertions, chain 30 -> 31); release-watch is documented as
> a **daily step** that is safe to schedule today because the zero-sources check fires first; and `/ai-models` +
> `/ai-models/methodology` now show the four stages with their real blockers, every figure derived from the data.
> **Lane 4 (09-18):** 9 draft task items (EQU/BND/SYS +3 each) proposed — merged 42-item bank passes the real
> validator (408 checks, 0 failures, 0 warnings) and clears the standing SYS thinness warning; the live bank is
> untouched. **Found in the published bank:** 2 of the 3 live EQU rubrics demand a comparison arm the items do not
> carry, so Identity Equity is unmeasurable as specified (backlog MB-5, founder-gated).
> Verified: `npm test` exit 0 (31 steps), `tsc` exit 0, fixture run 5 candidates / 4 dropped then 0 on repeat,
> `validate-model-releases` PASS with 2 records. **Uncommitted — awaiting founder.**

_Moved 2026-09-24, text unchanged: displaced from the top three by Iteration 34._

> 2026-09-18 (deploy verification — Iterations 19 and 21 are live): the founder deployed manually at 2026-09-17T21:40Z.
> Verified: `/data/scores/singapore.json` serves the **country (62.2)**; `/city/singapore` 301s to the city's new slug;
> **all 28 legacy URLs → 301 → 200, 0 `/404`, all https**; **1,323 of 1,323** ranking links still 200; the 09-17
> briefing is live with its corrected text (0 "sister", control "Imbue" 3). Negative control still 404s.
> **Two defects found BY this verification, both live:** (1) `/build-manifest.json` reports `sha: null,
> source: "unavailable"` because the image was built without the `GIT_SHA` build args that only `deploy.sh` and CI
> inject — It. 18's capability bypassed, so production again cannot name its commit (backlog BM-2); (2) **the evidence
> tier badges on every briefing page are inverted** — the UI maps tier 1 to "Gov/Court" and 5 to "Trade/Advocacy"
> against a documented scale where 5 is strongest, so a Boston.com article renders as "Tier 2 · UN/IO"
> (backlog EV-1, DC-12, v2 15 — the highest-scoring open item). Iterations 22 and 23 remain uncommitted.

_Moved 2026-09-20, text unchanged: displaced from the top three._

> 2026-09-17 (Iteration 23 — one slug rule, and a ratchet on the accented divergence): pages fold accents and the data
> stores do not, so `/city/sao-paulo` serves while `/data/scores/sao-paulo.json` **301s to `/404`** and the real file is
> `s-o-paulo.json` (verified live). **14 of 16** non-ASCII published names diverge. **12 scripts each defined their own
> slug function**, one claiming in a comment to match `src/lib/slugify.ts` while not folding accents. All 12 now import
> `site/scripts/lib/slug.mjs`, each keeping its current behaviour; the new `test:slug-conventions` gate (chain 29 -> 30)
> blocks a 13th copy, asserts a golden table, and ratchets `known-slug-divergences.json` (14, shrink-only).
> **Proven behaviour-preserving:** `public/data/**` regenerated with new and old code — **1,761 files, 0 differences**
> (timestamps excluded), with the comparator shown to detect a planted change. `npm test` exit 0 (30 steps).
> **Not fixed (RS-4b, founder-gated):** the fold itself, its 301s and the S9 re-derivation of every slug-keyed store.
> **Uncommitted — awaiting founder.**

_Moved 2026-09-18, text unchanged: displaced from the top three by Iteration 24._

> 2026-09-17 (Iteration 22 — RISK-015 gets advance notice): `validate-product-separation` now prints an
> `ADVANCE EXPIRY WARNINGS` block from **30 days** before any waiver lapses, escalating at 7, naming the waiver, its
> owner, the consequence date and the remediation draft; and it distinguishes `PASS WITH WAIVERS (6 waived — next
> expiry 2026-11-16, 60 days…)` from `PASS (clean)`. Exit codes unchanged. Waiver tests **17 → 41**, all on injected
> fixture dates. Verified by simulation, because today's clean output proves nothing (V8): 2026-10-18 → 1 warning,
> 2026-11-15 → 3 (figure critical, 1 day), and a correctly shaped failure is **waived through 2026-11-16 and blocks on
> 2026-11-17**. **Uncommitted — awaiting founder.**

_Moved 2026-09-18, text unchanged: displaced from the top three by the deploy-verification note._

> 2026-09-17 (Iteration 21 — the config production actually runs): the image ships `nginx.conf`, but **26 rewrites
> existed only in `nginx-ssl.conf`** (25 robotics-lab legal-name slugs + `/us-state/georgia`), so those legacy URLs
> **301'd to `/404`** live — verified before the change (`/robotics-lab/intuitive-surgical-inc` → `/404`;
> `/robotics-lab/intuitive-surgical` → 200). All 26 moved into `nginx.conf` (both files now parse to the same 106
> rewrite pairs, 0 unique to either, verified in both directions); `absolute_redirect off` stops redirects downgrading
> to `http://`; new `test:nginx-redirect-parity` gate (chain 28 → 29) proven by an independent planted probe; new CI
> job `nginx-config-syntax` (`nginx -t`) gates `deploy`; the `verify` job now sweeps 29 legacy URLs with a negative
> control; `deploy.sh` and the CI SSH script now print `git status --porcelain`, so `dirty: true` names its files. All
> 69 entity-route redirect targets verified to be published slugs. `npm test` exit 0 (29 steps).
> **Also found, not fixed:** TLS terminates at an **openresty** proxy in front of the container, and `/404` answers
> **HTTP 200** (a soft 404). **Uncommitted — awaiting founder.**

_Moved 2026-09-17, text unchanged: displaced from the top three by Iteration 23._

> 2026-09-17 (Iteration 20 — entity links stop depending on a redirect): four components re-derived entity slugs from
> names instead of honouring the pinned slug, so **34 links** (77 in `IndexPageCharts`, which also carried its own
> naive slugger) pointed at URLs that existed only because nginx rewrote them. Verified live first: `/global-cities`
> linked `/city/phoenix`, three days after Phoenix was pinned. Now one `rowSlug()` exported from `lib/slugify.ts` and
> imported by all four — five copies of the rule collapsed to one. New gate `test:pinned-slugs` (chain 27 → 28),
> proven by a planted probe that failed by name and left the file sha256-identical. `npm test` exit 0, `tsc --noEmit`
> exit 0, eslint exit 0. **Disclosed:** `test:no-stale-counts` failed the chain on my own hard-coded "8 indexes"
> comment — I removed the count rather than allowlisting it. **Uncommitted — awaiting founder**; file set disjoint
> from Iteration 19 per S6, which is the only reason two iterations may sit uncommitted at once.
> **Correction 2026-09-17 (re-verified live):** the "only because nginx rewrote them" premise is false. Most of these
> links currently **301 → `/404`** on production (e.g. `/company/atandt`, `/robotics-lab/intuitive-surgical-inc`),
> because the image ships `nginx.conf` while most rewrites live only in `nginx-ssl.conf` (DC-11, Meta-review 3).
> Deploying Iteration 20 removes these live broken links.
> **Deployed 2026-09-17:** commit `119f1757` (founder-approved), run 35249684018, all 4 jobs success. V7: live
> manifest `sha 119f1757`; **1,323 of 1,323** entity hrefs on the 8 ranking pages → 200, 0 redirects (a nonsense-slug
> control still → `/404`). `dirty: true` persists on the production checkout after a second deploy (undiagnosed).
> Iteration 19 committed `cad71c1a` 2026-09-17, awaiting manual deployment.

_Moved 2026-09-17, text unchanged: displaced from the top three by Iteration 22._

> 2026-09-16 (Iteration 19 — A-2 tranche 1): the bare slug `singapore` now resolves to the **country** (62.2), not
> the global city; the city moves to `singapore-global-cities` (56.2) with a 301 from `/city/singapore` in both nginx
> configs. Cross-index collisions **16 → 15**; unique slugs 1,309 → 1,310 of 1,325 entities; `validate-indexes`
> 64 → 63 warnings (0 errors, 85,455 checks); `test-entity-records` 19,702/0; `npm test` exit 0; 0 history files
> orphaned. **Coordinator scope error, disclosed:** I also pinned Figure AI and 1X Technologies, passed every gate,
> then found RISK-017 defers both to **D-13** (proposed, unratified) as an index-*ownership* question — one company
> must not hold two published composites — and reverted them to HEAD bytes. No gate encodes an unratified decision.
> **Committed `cad71c1a` 2026-09-17 (founder-approved); pushed with auto-deploy suppressed — awaiting manual
> deployment, then V7.** Remaining: 12 US-city twins, `washington-dc` (needs a both-sides pin), and the
> 2 labs (blocked on D-13 ratification).

_Moved 2026-09-17, text unchanged: the 4 notes below were displaced from the top three by Iterations 20–21._

> 2026-09-16 (founder-approved remediation batch + Iteration 14): Wellington applied (83.0 → 71.3, Exemplary →
> Established, rank 13 → 22; premium-cliff disclosure attached) · Score-Watch sales paused, badge widget hidden
> (RISK-014 mitigated, host still dead) · never-assessed share published on `/methodology` from generated data
> (811 of 1,329, 61.0%) · waiver cliff staggered across six dates (RISK-015 mitigated) · `CLAUDE.md` data notes
> corrected · entity-records test (19,687) and a slug-collision ratchet wired into `npm run test`, which CI runs
> before deploy. Coordinator defect disclosed: duplicate JSON keys in the Wellington proposal nulled the approval
> fields (DC-10), caught by `score-updater`. **In progress:** the 20 encoded Fortune 500 names (RISK-023).
> **Blocked on founder permission:** branch protection on `main`, `.bak` cleanup.
> **Deployed 2026-09-16 in three runs** (35112334235, 35114744386, 35118662309 — all jobs success; `main` at
> `c43cc037`). Verified live: renamed companies render and redirect correctly, Wellington at 71.3 Established,
> coverage figure on `/methodology`, Score-Watch paused with no reachable purchase path, and entity history restored
> for renamed entities. Two defects were found *by* post-deploy verification and fixed in later runs: stale
> "click Subscribe — $79/yr" instructions, and history orphaned by the rename (a coordinator regression, DC-05/RISK-018).

> 2026-09-14 (Iteration 13, first loop under scoring model v2): new `unapplied-score-movement` rule in
> `lint-daily-briefings` — from briefings dated 2026-09-15, a headline/summary may not state a score change as
> published when `scoreChangesApplied` is 0 (verified live defect in ≥ 5 cycles). Validation failed twice on
> precision before passing; final: lint tests 99/0, full suite exit 0, forward-dated exposure 31 flags (19 true +
> 2 borderline in the field era). RISK-020 reduced. **Uncommitted — awaiting founder.**

> 2026-09-14 (Iteration 12): ~20 hard-coded count literals across 11 public routes now derive from
> `entityCount.ts` / `INDEX_COUNT` (1,325 · 8 · 51 · 92); Universities added to four index lists; new
> `test:no-stale-counts` guard. **Uncommitted — awaiting founder.**

> 2026-09-14 (Iterations 10–11): false "balanced beats spiky" formula claim removed from `/ai-models/methodology`;
> dead `/cite` URL pattern fixed on `/cite`, `/media`, `/data`; `llms.txt` counts derived. **Committed
> (`beb94ae9`, `f940a80b`, `376b0f85`) and deployed 2026-09-14, verified on production.**

> 2026-07-12: Ran a 4-lens **nonprofit simplification audit** (product, architecture, UX,
> frontend) → consolidated 15-item backlog in `docs/NONPROFIT_SIMPLIFY_MASTER_2026-07-12.md`.
> Implemented **S1**: consolidated the 11-place index-registry duplication into one typed
> `site/src/data/indexRegistry.ts` with a fail-loud module-load invariant. This RESOLVES the
> long-standing tech-debt noted 2026-06-19 (below) AND fixed a live bug it had already caused —
> EntitySearch/NavbarSearch/test-entity-href all listed 7 indexes (missing Universities), so
> ~100 universities were unsearchable while `npm run test` passed green. Commit 92430e70;
> tsc/validate-indexes/test(40/40)/build(1924) all pass. Remaining backlog (S2–S15) gated on a
> founder free-vs-earned-income decision. Daily research current through 07-12 (all on `main`).

> Iteration 9 (2026-06-20): Methodology-page hardening — founder-authorized multi-item push (Tranche A,
> 12 items, 4 validated waves). Fixed a systemic formula-model inaccuracy (the page taught an incoherent
> "base /80" model contradicting the canonical `scoring.ts` and the live entity pages) across page.tsx +
> ScorePipelineDiagram + IntegrationPremiumDiagram; documented the three previously-hidden governing rules
> (attribution, near-floor limitation, harm-flag 0.0 floor); synced page version v1.1→v1.2; cleared the
> unanimous trust bugs (anchor header, broken TOC anchor, data-drift, always-on back-to-top). NO published
> scores changed. tsc clean; build 1,880 pages, 0 new errors. **Tranche B (8 score-changing items) GATED
> for founder approval** — see ITERATION_LOG Iteration 9 follow-ups + IMPROVEMENT_BACKLOG.

> 2026-06-19: Launched the **University Index** — 100 universities scored on the
> 8-dimension framework via the full lifecycle (PRD → architecture → 5 parallel
> scoring tranches → assembly → frontend+backend wiring → SEO+growth). Scored
> catalog 1,156 → 1,256; 8 indexes. Build 1,876 pages, validate-indexes 0 errors.
> Deferred: seed top-university sameAs identifiers; launch Special Briefing
> ("The Prestige–Compassion Gap"). Tech-debt noted by the architect: the index
> list is duplicated across 11 places (9 silent-on-miss) — consolidate to one
> registry as a follow-up.

> Iteration 8: completed the in-flight deep-dive backlogs for Home, Indexes,
> Updates, and Methodology (53 items; each page now 20/20 minus 1 founder-gated).
> All four backlog status logs reconciled. Un-reviewed page groups remain:
> index leaf pages, entity detail pages, commercial/conversion pages, assessment tools.

> Iteration 7: removed the deprecated `prepare-updates.mjs` stage from
> `scripts/nightly-pipeline.sh` + `research/run-pipeline.sh` (it clobbered the
> digest-authored rich briefing and would break the autonomous deploy). Replaced
> with a pre-push validation gate. Scheduling docs aligned.

> Note: This file lapsed between Iteration 3 (Apr) and Iteration 6 (Jun) while work
> ran through the page-improvement and daily-research tracks.

> 2026-09-14 (Iteration 10, full original note): Removed the false "balanced beats spiky at the same average"
> claim from the `/ai-models/methodology` FAQ (verified false under `scoring.mjs`); copy now describes the formula
> as it is. No score change. Validated the prior-session Worker typecheck fix. Gates: site tsc clean · `npm run
> test` all suites pass (scoring 125/125, model-releases 93/93) · build 1,978 pages · validate-daily-briefings
> 79/79. Deploy pipeline green 7 consecutive runs since 2026-09-09 (RISK-004 verification gap remains).

> 2026-09-14 (Iteration 11, full original note): `/cite`, `/media` and `/data` taught
> `compassionbenchmark.com/[index]/[slug]` (example `/fortune-500/microsoft` → soft 404 on production); now
> `[entity-type]/[slug]` with a prefix table rendered from `INDEX_REGISTRY`. `llms.txt` entity count derived from
> index data (1,325; was "1,260+") and lists `/cite` + `/ai-models`. 15/15 llms.txt URLs exist in export. Deploy
> run 34901047499: build+test, worker-typecheck, deploy, post-deploy health all success; production verified by curl.
