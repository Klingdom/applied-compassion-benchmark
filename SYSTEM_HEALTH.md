# SYSTEM HEALTH — Compassion Benchmark

Updated: 2026-06-18 | After: Iteration 8 (four page deep-dives complete)

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
- No analytics/tracking on the site
- No CI pipeline running tests/validation before deploy
- 8 of 10 core documentation artifacts missing

## Readiness
- **Development**: ✅ Ready
- **Testing**: ✅ Functional (needs unit tests)
- **Data Validation**: ✅ Automated (`npm run validate`)
- **Deployment**: ✅ Docker pipeline exists
- **Launch**: ⚠️ Needs analytics, CI gate, core artifacts
