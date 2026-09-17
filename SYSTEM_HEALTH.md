# SYSTEM HEALTH — Compassion Benchmark

Snapshot: **2026-09-15** (coordinator, measured — every figure below was re-run or re-read on this date unless marked)
Last change: Iteration 13 (unapplied-score-movement briefing gate) + Meta-review 1 · History: `ITERATION_LOG.md`

## Latest status notes (last 3; older notes archived at the bottom, verbatim)

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

## Canonical facts
- **Scored entities: 1,325** in **8 indexes** — countries 191 · US states 51 · Fortune 500 447 · AI labs 50 · robotics labs 92 · US cities 144 · global cities 250 · universities 100. Source of truth `site/src/data/entityCount.ts` (= `site/public/build-manifest.json` `totalEntities`). Never copy into UI copy; import it (guarded by `test-no-stale-counts`, pending commit).
- **Tracked for research: 1,329** (`research/rotation-state.json`); last cycle scanned 1,331 (2026-09-14).
- **Never individually assessed: 811 of 1,329 (61.0%)** — measured 2026-09-16 and reproduced independently by the coordinator; assessed within 30/60/90 days: 146 / 361 / 397; median assessment age 53 days, oldest 149. Generated by `research/scripts/coverage-report.mjs` → `research/coverage/<date>.{md,json}`, and published on `/methodology` from the generated `site/src/data/neverAssessedCoverage.ts` (never hand-typed). Previous snapshot: 820 / 61.7% on 2026-09-14.
- **Tracked 1,329 vs published 1,325:** the gap is 4 ai-labs entities tracked for research with no published index row — Reflection AI, Nvidia AI, SpaceX AI, Oracle AI (backlog RS-3; publish-or-delist is founder-gated).
- **Methodology:** v1.2 (`site/scripts/lib/scoring.mjs`), 8 dimensions, 40 subdimensions, 5 bands.
- **AI model benchmark (CB-MODEL):** pre-registration published at `/ai-models`; 0 models scored (D-29).

## Build and gates (measured 2026-09-15 unless noted)
| Gate | Result | Notes |
|---|---|---|
| `npm run build` | ✅ exit 0 (2026-09-14) | 1,978 static pages generated; 1,973 HTML files in `out/`; Pagefind 1,956 pages, **3.19 MB vs 2 MB target** (warning) |
| `validate-indexes` | ✅ 85,401 checks, 0 errors, 64 warnings | |
| `validate-daily-briefings` | ✅ 79 of 79 | |
| `lint-daily-briefings` | ✅ PASS | + `unapplied-score-movement` rule (uncommitted, It. 13) |
| `validate-product-separation` | ✅ PASS — **6 waived**, 10 warnings | All 6 waivers expire **2026-12-09** → every build fails from 12-10 (RISK-015) |
| `validate-model-releases` | ✅ PASS, 4 warnings | release-watch `scanState` "never-scanned" |
| `tsc --noEmit` (site) | ✅ clean | |
| Worker typecheck | ✅ passes; CI job `worker-typecheck` (non-blocking) | since `beb94ae9` |
| Build churn | ⚠️ `build-special-briefings.mjs:474` rewrites 16 tracked JSON timestamps every build | DC-08 |

## Tests (`npm run test`, **28 steps** at `119f1757`, generated 2026-09-17 by the command below; all passing — regenerate with `node -e "console.log(require('./site/package.json').scripts.test.split('&&').length)"`)
test:scoring (125) · test:lint (11 committed; 99 with It. 13) · test:history (39) · test:entity-href (40) · test:product-separation (16) · test:separation-waivers (17) · validate:product-separation · test:task-bank (68) · validate:task-bank · test:evaluation-scorer (45) · test:model-registry (38) · test:evaluation-statistics (78) · validate:evaluation-run · test:model-harness (58) · test:model-releases (93) · validate:model-releases · test:no-stale-counts (It. 12, uncommitted).
- **Wired 2026-09-16:** five guards added to the `test` chain, which CI runs before every deploy — `test:entity-records` (19,687/0), `test:collision-ratchet` (19), `test:coverage-report` (19), `test:encoded-names` (9) and `test:rotation-state` (28), plus a `validate:rotation-state` command. Build-failing behaviour: `export-public-data.mjs` rejects any cross-index slug collision not in the dated `site/scripts/known-collisions.json` (16 known, shrink-only), and `validate-indexes.mjs` check 17 rejects any HTML entity in a published entity name.
- **Rotation-state integrity:** 0 real gaps. 25 entities carry a WARN naming the evidence class that backs their `last_assessed` (5 alias-slug report, 20 same-date change proposal) — previously 25 blocking FAILs, all false (RS-1).
- **Unverified in this snapshot:** browser E2E suite (earlier "54 E2E tests" figure dates from April).

## Deployment
- **Auto-deploy:** ✅ 9 consecutive successful `Deploy to VPS` runs, 2026-09-09 → 2026-09-14 (after 53 failures 07-14 → 09-08). Last deployed commit `376b0f85`.
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

## Risks (RISKS.md — 17 entries, all open)
- **High / urgent:** RISK-014 Score-Watch sold, host NXDOMAIN · RISK-015 waiver cliff 2026-12-09 · RISK-016 research never run unattended · RISK-017/018 slug collisions (16) + accent mismatches (13) · RISK-020 briefing errors pass gates (reduced by It. 13, pending) · RISK-021 approval provenance unverifiable · RISK-001 majority placeholder scores.
- **New 2026-09-15:** RISK-023 — 20 Fortune 500 names published with visible HTML entities ("Procter &amp; Gamble") and three disagreeing slugs each; fix spec `docs/REMEDIATION_RISK-023_ENCODED_NAMES_2026-09-15.md` (founder-gated). Also: `validate-rotation-state.mjs` 22 FAILs are all false (evidence exists under older conventions) — backlog RS-1.
- **Also open:** RISK-002 held proposals · RISK-003 entity-currency defects · RISK-004 deploy verification · RISK-005 two disclosure conventions · RISK-006 band-boundary ambiguity · RISK-007 reputational (mitigated) · RISK-008 rotation-state tracking · RISK-019 formula cliff at 4.0 (copy fixed) · RISK-022 public admin surface / missing HSTS/CSP.

## Known data characteristics (non-blocking; re-verify before citing)
- Band boundaries disagree at exact integers and at 60.9 (RISK-006).
- Two "absence of disclosure" conventions live in ai-labs (RISK-005).
- *Unverified since 2026-04:* legacy composite offset of up to ~5 points; Clearview AI composite/calculated gap.
- *Corrected 2026-09-15:* "US States: 21 of 51 entries" is obsolete — all 51 states are published.

## Working tree (not deployed)
- **Committed 2026-09-15 on branch `release/2026-09-15`** (founder instruction; pushed for manual deployment, NOT `main`): It. 12 · It. 13 · research cycle 2026-09-15 (scan, 14 assessments, Wellington proposal, digest, corrected public briefing, feeds) · grant documents · governance docs. Combined state verified before commit: tsc clean · `npm run test` exit 0 · `npm run build` exit 0 (1,989 pages; Pagefind 1,967) · briefing validator 80/80 · lint 0 unapplied-movement violations.
- **Held:** America-at-250 rewrite of a published briefing (made ~2026-09-03; AUTONOMY §1c) · `research/entity-records-dryrun.json` (stale dry run).
- **Churn/local:** 16 special-briefing timestamp JSON + manifests · 2 `.bak` files · `.claude/settings.local.json`.
- **WIP limit (S6):** reached — no new implementation until commits are approved.

## Readiness
| Area | Status |
|---|---|
| Site build and deploy | ✅ green |
| Data validation | ✅ automated in build |
| Research cadence | ⚠️ manual; 62.5% of days with a completed cycle (Apr 15 → Sep 14); never unattended |
| Commerce | ❌ Score-Watch unfulfillable (RISK-014) |
| Security posture | ⚠️ HSTS/CSP missing; public analytics login (RISK-022) |
| AI model benchmark | ⏸ pre-registration, 0 models by design |

---

## Archive — earlier status notes (verbatim, moved 2026-09-15; figures are as of their dates and now stale)

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
