# Frontend Simplification Proposal — Nonprofit Transition

Author: frontend-engineer agent · Date: 2026-07-12
Scope: `site/` (Next.js App Router, static export). Code-hygiene and maintenance-surface
lens only — no product-scope decisions made here, no code changed.

## Why this doc exists

Compassion Benchmark is moving to a nonprofit model. Before that transition, the founder
asked for concrete SIMPLIFICATIONS a small nonprofit team could execute: dead code,
duplicated registries, and commercial-model pages/components that can be removed or
merged, without breaking the design system or static-export build.

This is a proposal only. Every row below is evidence-backed (file paths, importer
counts, and one live bug found during the survey). Nothing has been deleted or edited.

---

## Headline finding: the "duplicated index registry" tech debt is real, and it has already caused a live bug

`SYSTEM_HEALTH.md` (2026-06-19) flagged: *"the index list is duplicated across 11 places
(9 silent-on-miss) — consolidate to one registry as a follow-up."* That follow-up was
never done. During this survey I found **at least 9 independent hand-maintained copies**
of the "8 published indexes" list, and confirmed that **3 of them still only list 7
indexes** — they were never updated when the Universities Index shipped on 2026-06-19
(3+ weeks ago):

| File | Registry name | Count | University present? |
|---|---|---|---|
| `site/src/lib/entityHref.ts` | `KIND_TABLE` (canonical, typed) | 8 | Yes |
| `site/src/data/entities.ts` | `KIND_CONFIG` (adds Gumroad fields) | 8 | Yes |
| `site/src/data/entityCount.ts` | inline import list | 8 | Yes |
| `site/src/app/sitemap.ts` | `ENTITY_KINDS` + `indexPages` | 8 | Yes |
| `site/src/app/indexes/page.tsx` | imports + `COUNTS` + `INDEX_CARDS` + `collectionJsonLd.itemListElement` (4 sub-copies in one file) | 8 | Yes |
| `site/src/components/charts/BandDistributionBar.tsx` | `INDEX_DATA` | 8 | Yes |
| `site/src/components/index/IndexPageCharts.tsx` | `ENTITY_ROUTE_PREFIX` | 8 | Yes |
| `site/src/data/nav.ts` | `footerLinks.indexes` | 8 | Yes |
| **`site/src/components/index/EntitySearch.tsx`** | **`INDEX_REGISTRY`** | **7** | **No — missing** |
| **`site/src/components/layout/NavbarSearch.tsx`** | **`INDEX_REGISTRY`** | **7** | **No — missing** |
| **`site/scripts/test-entity-href.mjs`** | re-implemented `KIND_TABLE` (the *test* meant to catch this exact drift) | 7 | **No — missing** |

**Concrete impact:** the on-page search widget (`/indexes`) and the navbar search
(every page, via `Navbar.tsx`) cannot find any of the ~100 universities in the
Universities Index. A visitor searching "Harvard" or "MIT" in site search gets zero
results, even though `/university/harvard-university` exists and is fully published.
This has been silently broken since launch. The regression test that was written
specifically to prevent index-list drift (`test:entity-href`) also drifted, so `npm run
test` passes green while the bug is live — the test re-implements its own copy of
`KIND_TABLE` instead of importing the real one.

This is the single strongest argument for consolidation: it isn't hypothetical
tech debt, it's an active, undetected user-facing defect caused by exactly the
duplication pattern SYSTEM_HEALTH warned about.

---

## Proposal table

| # | Title | Files/paths affected | Change | Blast radius (importers/references) | Impact (1-5) | Effort (1-5) | Risk (1-5) |
|---|---|---|---|---|---|---|---|
| 1 | **Consolidate the index registry into one typed source** (`src/data/indexRegistry.ts`, sourced from the existing `IndexFileSchema`/`entityHref.ts` `KIND_TABLE`) | `entityHref.ts`, `entities.ts` (`KIND_CONFIG`), `entityCount.ts`, `sitemap.ts`, `indexes/page.tsx`, `BandDistributionBar.tsx`, `IndexPageCharts.tsx`, `nav.ts`, `EntitySearch.tsx`, `NavbarSearch.tsx`, `scripts/test-entity-href.mjs` | Merge 11 hand-maintained copies into 1 exported array/map; every consumer imports it instead of re-declaring | 11 files confirmed above; fixes the live universities-not-searchable bug in 2 of them | 5 | 3 | 2 |
| 2 | **Retire the commercial "services ladder" page cluster** — `/services`, `/pricing`, `/enterprise`, `/advisory`, `/certified-assessments`, `/data-licenses`, `/contact-sales`, `/purchase-research` + `components/purchase/ResearchConfigurator.tsx` + `components/purchase/SalesInquiryForm.tsx` | 8 route files (~2,530 LOC) + 2 components (~373 LOC) = ~2,900 LOC | Delete or fold into a single "Support / Contact" page | `nav.ts` (`footerLinks.services`, 8 links), `sitemap.ts` (`servicePages` array), `indexes/page.tsx` (3 sections cross-link to these), `entities.ts` `KIND_CONFIG.gumroadUrl/gumroadPrice`, `EntityDetail.tsx` purchase CTA block, `build-search-index.mjs` exclusion list (already excludes most of these — see #8) | 5 | 4 | 3 |
| 3 | **Retire or replace `gumroad.ts` and the Score-Watch/purchase monetization layer** | `site/src/data/gumroad.ts` and its **17 importers**: `analytics.ts`, `entities.ts`, `HistoryTimeline.tsx`, `EntityDetail.tsx`, `score-watch/page.tsx`, `pricing/page.tsx`, `indexes/page.tsx`, `robotics-labs/page.tsx`, `global-cities/page.tsx`, `fortune-500/page.tsx`, `countries/page.tsx`, `ai-labs/page.tsx`, `api-access/page.tsx`, `supporters/SupporterCta.tsx`, `api-access/ApiAccessCta.tsx`, `purchase-research/page.tsx`, `ResearchConfigurator.tsx` | Delete `GUMROAD`, `SCORE_WATCH`, `US_CITIES_INDEX`, `US_STATES_INDEX`, `SUPPORTER`, `API_ACCESS`, `UNIVERSITIES_INDEX`, `buildScoreWatchUrl`; replace with a single `DONATE_URL`/`SUPPORT` config if the nonprofit keeps a support ask | 17 files. Deepest touch point: `entities.ts` `KIND_CONFIG` embeds `gumroadUrl`/`gumroadPrice` per kind, consumed on **every entity detail page** (~1,256 pages) via `EntityDetail.tsx`'s purchase CTA and `BadgeEmbedWidget`'s sibling block | 5 | 4 | 4 |
| 4 | **Retire the two high-ticket standalone commercial products** — `/prompting-suite-for-humans` ($3,500 / $9,500-yr / $28,000-yr tiers) and `/ai-evaluation-suite` ("License the Platform" → `/contact-sales`) | 2 route files, 677 LOC combined | Delete (or archive as legacy-html reference) | `nav.ts` (`footerLinks.tools`), already excluded from Pagefind search index (`build-search-index.mjs` groups them with "Interactive tools") | 4 | 2 | 2 |
| 5 | **Consolidate the three overlapping "get assessed" entry points** — `/self-assessment` (12-line wrapper, free tool), `/assess-your-organization` (289 lines), `/certified-assessments` (282 lines) | 3 route files | Needs a product decision on which survives; likely keep `/self-assessment` (free, mission-aligned) and merge/delete the other two | `nav.ts` (`footerLinks.tools` + `footerLinks.services`), `indexes/page.tsx` "Assess your organization" callout links to `/assess-your-organization` | 3 | 3 | 3 |
| 6 | **Delete `/api-access` and `/supporters`** — both are placeholder commercial tiers that were never launched (`gumroad.ts` marks `apiAccess`/`supporterMonthly` URLs as `TODO-*` and `useGumroad: false` for both) | `api-access/page.tsx`, `api-access/ApiAccessCta.tsx`, `supporters/page.tsx`, `supporters/SupporterCta.tsx` | Delete (4 files, ~all dead-storefront code — no real product exists behind either CTA) | `nav.ts` (`footerLinks.community`, both entries), `gumroad.ts` (`API_ACCESS`, `SUPPORTER`, `usCitiesIndex`/`usStatesIndex`/`supporterMonthly`/`apiAccess` TODO constants become unreachable once these are gone), `analytics.ts` (`SUPPORTER_CLICK`, `API_ACCESS_CLICK` events become dead) | 3 | 1 | 1 |
| 7 | **Type the data-import layer around the existing `IndexFileSchema`** (zod schema already defined in `src/data/schema.ts` and used in `entities.ts`) instead of repeating ad hoc `as { rankings: unknown[] }` / `as { rankings: Array<{ band?: string }> }` casts | `entityCount.ts`, `indexes/page.tsx`, `BandDistributionBar.tsx`, `IndexPageCharts.tsx`, `EntitySearch.tsx`, `NavbarSearch.tsx` (6 files with independent untyped-cast patterns) | Export one `getIndexData(slug): IndexFile` accessor from the new registry module (#1) that returns the already-validated, already-typed shape | Same 6 files feed into #1's consolidation — can be done as one combined PR | 3 | 2 | 2 |
| 8 | **Fix the Pagefind search-index exclusion gap** — `scripts/build-search-index.mjs`'s `EXCLUDED_PAGE_NAMES` set excludes `advisory`, `enterprise`, `certified-assessments`, `data-licenses`, `services`, `contact-sales`, etc. but **not `pricing`** | `site/scripts/build-search-index.mjs` (`EXCLUDED_PAGE_NAMES`, line ~62-85) | Add `"pricing"` to the set for consistency with its commercial siblings (or remove the whole set once #2 deletes these pages) | None outside this file — self-contained one-line fix | 2 | 1 | 1 |

---

## "Safe to delete once monetization is removed" vs. "needs a product decision first"

**Safe to delete once monetization removed (mechanical, low ambiguity):**
- `/api-access`, `/supporters` and their CTA components (#6) — dead storefronts, no live product behind either
- `gumroad.ts` itself once every importer in #3 is gone or repointed — the file's only job is holding Gumroad URLs
- `/thank-you` + `ThankYouClient.tsx` — exists solely to fire `PURCHASE_CONFIRMED` after a Gumroad checkout redirect; meaningless with no purchase flow
- `analytics.ts` `EVENTS.SUPPORTER_CLICK`, `API_ACCESS_CLICK`, `PURCHASE_CONFIRMED`, `PRICING_BOOKING_CLICK`, `PRICING_SELFSERVE_CLICK`, `PRICING_REPORT_REQUEST` — dead event names once their pages are gone (do not delete `trackEvent`/`EVENTS` itself — `BRIEFING_*`, `SIGNAL_EXPAND`, `SHARE_CLICK`, `EMBED_CITED`, `PEER_CLICK` etc. are mission-content instrumentation and should stay)
- `EXCLUDED_PAGE_NAMES` in `build-search-index.mjs` shrinks to near-empty once the commercial pages it lists no longer exist (#8's fix becomes moot, or the whole set is deleted)
- `/prompting-suite-for-humans`, `/ai-evaluation-suite` (#4) — no scoring/mission dependency, purely commercial add-on products

**Needs a product decision first (founder call, not mechanical):**
- What replaces `/services` and `/pricing` — does the nonprofit keep any paid tier (data licensing, advisory) or go fully free-with-donations? This gates the size of #2 and #3.
- Whether `/purchase-research` reports (`$195` PDF editions) continue in any form, or the "Countries Index report" upsell blocks on `/indexes` and `/countries` etc. are removed entirely
- Which of `/self-assessment`, `/assess-your-organization`, `/certified-assessments` survives (#5) — `/self-assessment` looks most mission-aligned (free, public tool) but the founder should confirm before the other two are removed
- Whether `BadgeEmbedWidget.tsx` (the free "embed this score badge" widget, `entity/BadgeEmbedWidget.tsx`) stays — **note this is NOT commercial** (explicitly free, no Gumroad tie, attribution-flywheel pattern like OWID) and should be preserved regardless of the monetization decision; flagging only so it isn't accidentally swept into the commerce cleanup since it sits in the same "below Score-Watch CTA" region of `EntityDetail.tsx`
- Whether Score-Watch (`/score-watch`, $79/yr alerts) is kept as the nonprofit's one remaining paid product or retired — it's the only Gumroad product marked `useGumroad: true` and actually live (webhook-wired via the Cloudflare Worker), unlike the TODO-placeholder products in #6

---

## Verification plan (how each change would be validated to preserve determinism)

1. **Type safety**: `npx tsc --noEmit` from `site/` must stay clean before and after every change. The consolidated registry (#1, #7) should *reduce* total type-assertion (`as {...}`) sites — a rough count of `as {` occurrences in the touched files (currently 6+ independent cast shapes) is a cheap before/after regression check.
2. **Data integrity**: `npm run validate` (`scripts/validate-indexes.mjs`, currently 12,750 checks, 0 errors) must show an unchanged pass count after #1/#7 — this proves the registry consolidation didn't change which data is read, only where the list is declared.
3. **Entity-href contract test**: `npm run test:entity-href` currently re-implements its own 7-entry `KIND_TABLE` (the bug source above). Fixing #1 should also fix this test to *import* the real `KIND_TABLE`/registry rather than re-declare it, so future new indexes can't silently drift again. Add one explicit assertion: `ALL_ENTITY_KINDS.length === 8` (or read from the registry module) so a missing kind fails loudly instead of silently.
4. **Build determinism**: `npm run build` (currently 1,666-1,880 pages depending on iteration; check current count before starting) — after route deletions (#2, #4, #5, #6) the prerendered page count must drop by *exactly* the number of deleted routes (static pages, no dynamic segments on these). Any other delta indicates an unintended side effect (e.g. a deleted page was still being statically linked from `generateStaticParams` elsewhere).
5. **Link integrity**: after #2/#4/#5/#6, grep `nav.ts`, `sitemap.ts`, `indexes/page.tsx`, `EntityDetail.tsx`, and `services/page.tsx` (if still present) for any remaining `href="/deleted-route"` — the existing 54 Playwright E2E tests should also be re-run since several likely click through footer/nav links.
6. **Search index**: `scripts/build-search-index.mjs` output (`out/_pagefind/` size, currently well under the 2 MB target per `ARCHITECTURE_ARCHIVE.md §3`) should only shrink after route deletions; re-run the build and confirm the size-check warning (line ~226-232) still doesn't trigger.
7. **Gumroad blast-radius closure**: after #3, `grep -rn "gumroad" site/src --include=*.ts --include=*.tsx` should return zero hits outside of git history / archived docs — use this as the literal "done" signal for the monetization-removal task, run before requesting QA sign-off.
8. **Manual smoke test**: search "Harvard" or "Stanford" in both `/indexes` on-page search and the navbar search widget — should return results immediately after #1 lands, serving as the concrete regression check for the bug this proposal surfaced.

---

## Summary of scope

- **9 proposal rows**, spanning 1 registry consolidation, 4 deletion/merge candidates gated on the monetization decision, 1 low-risk mechanical deletion (`/api-access` + `/supporters`), 1 typing improvement, and 1 one-line config fix.
- **Total commercial-page LOC in scope for removal**: roughly 2,900 (services ladder) + 677 (two suite products) + ~750 (api-access/supporters/thank-you) ≈ **4,300+ lines** of route code, plus the `gumroad.ts` monetization layer and its 17 importers.
- **One live bug found and documented**: Universities (the 8th index, live since 2026-06-19) is unsearchable via both the `/indexes` search widget and the navbar search, and the regression test meant to prevent this class of bug (`test:entity-href`) has itself drifted out of sync with the real registry.
