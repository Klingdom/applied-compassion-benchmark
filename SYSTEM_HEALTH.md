# SYSTEM HEALTH — Compassion Benchmark

Updated: 2026-07-12 | After: nonprofit simplification audit (4 lenses) + S1 registry consolidation

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
> ran through the page-improvement and daily-research tracks. Build/validation rows
> below are refreshed; a full coverage refresh remains a deferred follow-up.

## Canonical facts
- **Scored entities: 1,156** — single source of truth `site/src/data/entityCount.ts` (sum of `rankings.length` across 7 indexes). Citable catalog size.
- **Scanned nightly: 1,160** — `pipeline.entitiesScanned` (rotation-state coverage; includes unpublished entities). Distinct metric; use only with "scanned" wording.

## Build Status
- **Build**: ✅ `npm run build` — 1,666 pages prerendered (static export)
- **Gates**: ✅ validate-indexes (12,750 checks, 0 errors, 128 warnings) · validate-daily-briefings (30/30) · lint-daily-briefings (clean) · tsc --noEmit clean
- **Search index**: ✅ Pagefind — 1,649 research pages indexed

## Artifact Coverage
| Artifact | Status |
|----------|--------|
| PRD.md | ❌ Missing |
| ARCHITECTURE.md | ❌ Missing |
| API_SPEC.md | ⬜ N/A (static site) |
| DATA_MODEL.md | ❌ Missing |
| UX_FLOWS.md | ❌ Missing |
| TEST_PLAN.md | ❌ Missing |
| SECURITY_REVIEW.md | ❌ Missing |
| LAUNCH_PLAN.md | ❌ Missing |
| METRICS.md | ❌ Missing |
| CHANGELOG.md | ❌ Missing |
| IMPROVEMENT_BACKLOG.md | ✅ Created |
| ITERATION_LOG.md | ✅ Created |

## Quality Scores
- **Test coverage**: Moderate — 54 E2E tests, 0 unit tests
- **Data integrity**: ✅ Validated — 7 JSON files, 1,155 entities, 12,686 checks pass
- **Type safety**: Partial — data imports are untyped
- **Code correctness**: No known critical issues

## Known Data Characteristics (non-blocking)
- Legacy composite formula differs from `((raw-1)/4)*100` by up to ~5 points (systematic offset)
- Band boundary assignments inconsistent at decimal composites (e.g., 40.6 → developing vs functional)
- US States: 21 of 51 entries (ranks 9-38 missing from source HTML), band counts reflect full 51
- Clearview AI: composite=3.9 vs calculated=10.9 (7.0 diff, largest single outlier)

## Known Blockers
- ~~No analytics/tracking on the site~~ **CORRECTED 2026-06-22:** Umami IS live (self-hosted at `/u`, real `data-website-id` in layout `<head>`) with a typed `trackEvent`/`EVENTS` helper (`site/src/lib/analytics.ts`) and conversion events wired across Button/links. Do NOT add a second tracker. Follow-up: wire Umami events on the new `/pricing` CTAs (booking-click, report-click).
- CI builds + tests run on push (`.github/workflows/deploy.yml`); the VPS auto-deploy step is broken (SSH key not authorized — manual deploy in use). Not "no CI."
- 8 of 10 core documentation artifacts missing

## Readiness
- **Development**: ✅ Ready
- **Testing**: ✅ Functional (needs unit tests)
- **Data Validation**: ✅ Automated (`npm run validate`)
- **Deployment**: ✅ Docker pipeline exists
- **Launch**: ⚠️ Needs analytics, CI gate, core artifacts
