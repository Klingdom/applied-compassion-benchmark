# Site Review — Code, Function & Architecture

**Date:** 2026-06-12
**Scope:** Whole-site review of `site/` (Next.js 16 static export), the prebuild/build pipeline, data flow, the Cloudflare Worker, and Docker/CI. Lens: **improve AND simplify** — cut complexity and tech-debt without losing capability, while preserving determinism, traceability, and the build gates.
**Mode:** Review only. No code modified.

---

## Executive summary

The application core is in good shape. The per-kind entity and history pages are already collapsed into thin factory wrappers (`renderEntityPage.tsx` / `renderHistoryPage.tsx`), the scoring math is centralized in `lib/scoring.ts`, and the build gates (`validate-indexes`, `lint`/`validate-daily-briefings`, `build-manifest`, Pagefind) form a real determinism contract. The debt is concentrated in five places, none of which require touching that core:

1. **~1,500 generated-but-tracked JSON artifacts in `site/public/data/`** that are regenerated on every build and serve no source-tree purpose — the single largest source of git churn and review noise.
2. **One confirmed dead 2,166-line file** (`DailyBriefing.legacy.tsx`) that TypeScript, ESLint, and every new engineer still pay for.
3. **A kind → index → route mapping duplicated 5+ times** across components and the data layer, with `entityHref.ts` already the canonical home.
4. **Two near-identical composite implementations in `scoring.ts`** documented as "mirrors the math exactly" — a real determinism/drift risk in the most traceability-sensitive file in the repo.
5. **Redundant CI** (two push-triggered workflows) plus accumulated one-off migration scripts in `site/scripts/`.

Findings are ranked by leverage: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**. Lead with the highest-leverage, lowest-risk cleanup first.

---

## Findings (ranked by leverage)

### 1. Stop tracking generated `public/data/**` artifacts — gitignore + regenerate

**Leverage: highest. Effort: very low. Risk: low.**

**Evidence.**
- `site/public/data/scores/*.json` contains ~1,400+ per-entity files (Fortune 500 + countries + states + cities + labs), plus `site/public/data/history/*.json` (~60+) and `site/public/data/indexes/*.json` (7).
- All three trees are written by prebuild scripts on every build: `scripts/export-public-data.mjs` ("Runs as the `prebuild` step … so every `npm run build` produces fresh data files"), `scripts/build-entity-history.mjs`, and the index export.
- They are **not** in `.gitignore` (which only lists `site/.next/`, `site/out/`, certbot, logs). So every prebuild rewrites ~1,500 tracked files → massive, meaningless diffs on every research commit.
- Nothing in `site/src` reads `public/data/scores/` — confirmed by grep (the only `scores` references in `entities.ts` are the unrelated `Entity.scores` dimension field). These files are consumed **only** by the Worker at runtime via `https://compassionbenchmark.com/data/scores/<slug>.json` (`worker/src/index.ts:324`).
- The Docker build (`Dockerfile`) runs `npm run build` inside the image, which regenerates `public/data` before `next build` copies it into `out/`. The served files come from the fresh build, never from the git copies.
- `site/src/data/history/` (the *source*) is empty — history is derived purely from daily briefings. So `public/data/history` is 100% derived state.

**Why it matters.** These artifacts are derived state checked into source. They inflate diffs, hide real changes in review, bloat clone size, and create false merge conflicts — while contributing nothing the build doesn't reproduce deterministically.

**Recommendation (simplify / delete from tracking).**
- Add `site/public/data/scores/`, `site/public/data/history/`, and `site/public/data/indexes/` to `.gitignore`; `git rm --cached` the existing files (keep on disk).
- Keep the **source** inputs tracked (`src/data/indexes/*.json`, `src/data/updates/daily/*.json`, `src/data/evidence-reviews/*.json`) — those are the real source of truth.
- The GitHub Actions `verify` job already proves regeneration works by probing the *live* URLs (`/data/index.json`, `/data/scores/slovakia.json`) post-deploy — that is the correct contract, not git tracking.

**Risk note.** Determinism is *preserved*, not weakened: the generator is documented idempotent and runs in prebuild and inside Docker. The only thing lost is the ability to read a stale committed copy that no build path uses. Verify `index.json` (the catalog) is also generated (it is, per `export-public-data.mjs`) before un-tracking, so nothing reads a now-missing committed file at build time.

---

### 2. Delete `DailyBriefing.legacy.tsx` (2,166 lines, zero imports)

**Leverage: very high. Effort: trivial. Risk: very low.**

**Evidence.**
- `site/src/components/updates/DailyBriefing.legacy.tsx` is 2,166 lines. Grep across all `.ts`/`.tsx` source finds **zero imports** of `DailyBriefing.legacy` — only doc files reference it. The live component is `DailyBriefing.tsx`, imported by `app/updates/page.tsx` and `app/updates/[date]/page.tsx`.
- It still carries a full duplicate of `resolveSlugHref` + `KIND_TO_INDEX_SLUG` (`DailyBriefing.legacy.tsx:98–115`) and 7 inline `entityHref` call sites — all dead.
- This has been flagged in at least four prior review docs (`UPDATES_BACKLOG2_2026-06-10.md` item 12, `PAGES_REVIEW_FRONTEND_2026-06-11.md`) and never actioned.

**Why it matters.** TypeScript compiles it, ESLint lints it, and every engineer onboarding to the briefing system must disambiguate "which one is current." It is pure carrying cost with no upside.

**Recommendation (delete).** `git rm site/src/components/updates/DailyBriefing.legacy.tsx`. Run `npm run build` to confirm a clean build. No other change needed — git history preserves it if ever wanted.

**Risk note.** Confirmed unreferenced; the rollback is `git revert`. Effectively zero risk.

---

### 3. Collapse the kind → index → route mapping into one source (extend `entityHref.ts`)

**Leverage: high. Effort: low. Risk: low.**

**Evidence.** The same seven-way kind/index/route mapping is reimplemented in at least five places:
- `lib/entityHref.ts` — `INDEX_ROUTE_PREFIX` (index slug → route prefix). **This is the canonical home.**
- `components/updates/DailyBriefing.tsx:117–135` — private `KIND_TO_INDEX_SLUG` + `resolveSlugHref`.
- `components/updates/TopSignals.tsx:283–301` — identical private copy.
- `components/updates/briefing/OpeningQuestion.tsx:35–52` — identical private copy.
- `components/index/RankingTable.tsx:29` — another `KIND_TO_INDEX_SLUG`, comment even admits "Kept aligned with `entityHref.ts` INDEX_ROUTE_PREFIX."
- `components/entity/renderEntityPage.tsx:40–61` — `INDEX_META` and `COHORT_FIELD` re-list the same seven index slugs.
- (plus the now-dead copy in `DailyBriefing.legacy.tsx`, removed by Finding 2.)

`resolveSlugHref(kind, slug)` is just `entityHref(KIND_TO_INDEX_SLUG[kind], slug)`. Both maps are two views of one table.

**Why it matters.** A new index (or a route rename) requires editing 5+ files in lockstep; the "Kept aligned with" comment is an explicit admission that this is manually load-bearing. This is exactly the kind of implicit contract the review brief asks to make explicit.

**Recommendation (merge).** In `lib/entityHref.ts`, define one canonical table keyed by `EntityKind` with `{ indexSlug, routePrefix }`, derive `INDEX_ROUTE_PREFIX` from it, and export:
- `entityHrefByKind(kind, slug)` (replaces all `resolveSlugHref` copies),
- `kindToIndexSlug(kind)` (replaces the `KIND_TO_INDEX_SLUG` copies in RankingTable/TopSignals/OpeningQuestion/DailyBriefing).
Replace the three live `resolveSlugHref` definitions and the RankingTable map with imports. Leave `INDEX_META`/`COHORT_FIELD` data in `renderEntityPage` but key them off the shared kind list so the slug set can't drift.

**Risk note.** Pure refactor with identical behavior; the 119-test suite plus the build gates (`validate-indexes`) catch slug regressions. Do it *after* Finding 2 so you don't touch the dead file. Keep each map's values byte-identical to today to avoid any href change.

---

### 4. Unify the two composite implementations in `scoring.ts`

**Leverage: high (traceability). Effort: low–medium. Risk: medium — touches the most sensitive file.**

**Evidence.** `lib/scoring.ts` has two functions computing the same composite by two different paths:
- `calcScores(subdimScores)` — averages subdims → dims, then computes baseComposite, consistency multiplier (1.5/3.0/5.0 thresholds), weakness factor, harm check, integration premium.
- `computeCompositeFromDimensions(dimScores)` — the dim-level entry point, whose own docstring says it "**Mirrors the math in calcScores exactly**."

The threshold ladder, weakness factor (`weakDims * 0.2`), harm rule (`v === 0`), and premium (`10 * mult * factor`) are copy-pasted in both. Only the averaging prefix differs.

**Why it matters.** This is the institution's core measurement and the most traceability-critical code in the repo. Two hand-synced copies of the formula can silently drift — and a drift here changes published scores. "Mirrors exactly" is a comment, not a guarantee.

**Recommendation (refactor to one core).** Extract a private `compositeFromDimVals(dimVals: number[]): CompositeBreakdown` containing the single shared formula. Have `computeCompositeFromDimensions` map the dim record to `dimVals` and call it; have `calcScores` do the subdim→dim averaging, then call the same core. One formula, two thin adapters.

**Risk note.** This is the highest-risk item because it changes the shape of `scoring.ts`. Mitigate by: (a) keeping the extracted math byte-for-byte identical, (b) running `test:scoring` (52 cases) before/after and confirming identical output, and (c) doing it as an isolated PR. The existing test suite is the safety net that makes this safe to do.

---

### 5. Extract `resolveSlugHref` consumers' shared briefing utils; finish the `briefing/utils.ts` consolidation

**Leverage: medium. Effort: low. Risk: low.**

**Evidence.** Prior review (`UPDATES_REVIEW_FRONTEND_2026-05-29.md`) noted `formatDateLabel`/`normalizeBand`/`deltaColor`/`formatIndex` are already exported from a `briefing/utils.ts` yet still privately redeclared inside `DailyBriefing.tsx`. This overlaps Finding 3 (the slug helpers) and should be done in the same pass.

**Recommendation (merge).** Move the slug helpers (Finding 3) into the shared lib and the briefing formatters into the existing `briefing/utils.ts`; delete the inline redeclarations in `DailyBriefing.tsx`, `TopSignals.tsx`, `OpeningQuestion.tsx`. Net: fewer private copies, one import each.

**Risk note.** Mechanical; covered by `lint`/`validate-daily-briefings` gates and the briefing tests.

---

### 6. Decompose `EntityDetail.tsx` along its already-marked "Wave" seams

**Leverage: medium. Effort: medium. Risk: low–medium.**

**Evidence.** `EntityDetail.tsx` has grown to a large single file with the main component starting at line 344 and an expanding Props interface (the comments literally segment it into "Wave E1 additions," "Wave 2 additions," etc.). It already contains extractable sub-pieces: `CohortRug` (line 1332), `DimDeviationBars` (1440), plus pure builders (`buildTrendCaption`, `buildBandCounts`, `buildConsistencyCallout`, `buildKeyTakeaway`, `getCompositeBreakdown`).

**Why it matters.** Maintainability and review surface. The "Wave N additions" comment pattern shows the file is accreting props faster than it's being factored — the classic growth trajectory that produced `DailyBriefing.legacy`.

**Recommendation (refactor, defer below 1–5).** Extract the pure builder functions into a colocated `EntityDetail.helpers.ts` (unit-testable, no JSX), and move `CohortRug` + `DimDeviationBars` into `components/charts/` (where the other strip/bar/radar charts already live). Leave the orchestrating component thin. Do **not** change the Props contract — `renderEntityPage` is the only caller and must keep passing the same shape.

**Risk note.** Larger surface than 1–5; sequence it last. Extracting *pure* builders first (no JSX, easily unit-tested) is the safe first step and immediately closes a test-coverage gap (see Finding 8).

---

### 7. Consolidate / prune CI and one-off migration scripts

**Leverage: medium. Effort: low. Risk: low.**

**Evidence.**
- Two workflows both trigger on push to `main`: `.github/workflows/deploy.yml` (build+test+SSH deploy+health check — the real one) and `.github/workflows/docker-image.yml` (a throwaway `docker build … --tag my-image-name:$(date +%s)` with no push/cache/test value). The latter is boilerplate that duplicates the build already proven in `deploy.yml`.
- The review brief notes the auto-deploy is "known broken." `deploy.yml` is well-structured (serialized concurrency, secret preflight, `--ff-only`, post-deploy health probes) — if it's failing it is almost certainly a **missing-secret / SSH-key** configuration issue, not a workflow-logic problem (the secret-preflight step will emit `::error::Missing required GitHub secrets`). This is an ops-config fix, not a code rewrite.
- `site/scripts/` carries one-off, dated migration scripts that are not part of any pipeline: `apply-2026-04-30-batch.mjs`, `apply-floor-designation.mjs`, `apply-changes.mjs`, `recompute-composites.mjs`, `backfill-daily.mjs`. None are referenced by `package.json` scripts; they were applied once and committed.

**Recommendation (prune / clarify).**
- Delete `docker-image.yml` (its build is redundant with `deploy.yml`'s build step).
- For `deploy.yml`: confirm `VPS_HOST`/`VPS_USER`/`VPS_SSH_KEY` secrets exist; the workflow itself is sound and worth keeping as the path off manual Docker deploys.
- Move the dated one-off `apply-*`/`backfill-*`/`recompute-*` scripts into `site/scripts/migrations/` (or delete the truly spent ones) so the top-level `scripts/` dir contains only live pipeline + test tooling. Keep `extract-rankings.mjs` and the prebuild/gate scripts where they are.

**Risk note.** Removing `docker-image.yml` removes nothing the real workflow doesn't cover. Don't touch `deploy.yml` logic. Confirm a migration script isn't silently re-run anywhere before relocating.

---

### 8. Close test-coverage gaps on pure logic before refactoring

**Leverage: medium (enables 4 & 6 safely). Effort: low. Risk: none.**

**Evidence.** The 119 tests cover `scoring` (`test-scoring.mjs`, 52 cases), `lint-briefings`, and `build-entity-history` — the deterministic data pipeline, appropriately. Gaps: the pure UI builders now buried in `EntityDetail.tsx` (`buildTrendCaption`, `buildKeyTakeaway`, `buildConsistencyCallout`, cohort/percentile math) and `entityHref` resolution have no direct tests, yet they encode product-visible logic.

**Recommendation.** As part of Finding 6's extraction, add a small `test-entity-detail-helpers.mjs` covering the pure builders, and a 6-line `entityHref` table test (known index → expected route, unknown → null). Wire both into `npm test`. This converts Findings 3, 4, and 6 from "trust the comment" to "proven by gate."

**Risk note.** None — additive tests only.

---

## Non-findings (explicitly healthy — do not "simplify" these)

- **Per-kind entity/history pages** (`app/company/[slug]/page.tsx` etc.) are already 1-line wrappers over `makeEntityPage`/`makeHistoryPage` factories. This is the right abstraction; leave it.
- **Build gates** (`validate-indexes`, `lint`/`validate-daily-briefings`, `build-manifest`) are the determinism contract. Preserve all of them through every refactor above.
- **`build-og-images.mjs`** correctly guards `satori`/`resvg` as `optionalDependencies` with try/catch + `exit(0)` so a missing native dep can never break the Docker build. Good defensive design; keep as-is.
- **Worker independence boundary** (`worker/src/index.ts`: "NO GitHub token and NO write path to the VPS filesystem") is a clean commercial/measurement separation that matches the independence policy. Do not couple the Worker to score generation.
- **History data-access via `fs.readFileSync`** (`data/history/index.ts`) vs **index data via ES import** is a mild inconsistency but intentional (history is generated post-checkout into `public/`). Not worth unifying unless Finding 1's gitignore work makes a cleaner `src/data/generated/` location attractive — note it, don't act now.

---

## Recommended sequence (lowest risk → highest)

1. **Finding 2** — delete the dead 2,166-line file (trivial, unblocks 3 & 5).
2. **Finding 1** — gitignore + un-track `public/data/**` (kills the churn; pure ops).
3. **Finding 7** — drop redundant `docker-image.yml`, relocate one-off scripts, fix deploy secrets.
4. **Finding 8** — add pure-logic tests (safety net for 3, 4, 6).
5. **Finding 3 + 5** — collapse the kind/index/route mapping + briefing utils into one source.
6. **Finding 4** — unify the two composite formulas behind one core (run `test:scoring` before/after).
7. **Finding 6** — decompose `EntityDetail.tsx` along its Wave seams (last; largest surface).

Each step preserves determinism, traceability, and all build gates. Findings 1–3 alone remove ~1,500 churning artifacts and ~2,200 lines of dead code with effectively zero behavioral risk — that is the bulk of the available leverage.
