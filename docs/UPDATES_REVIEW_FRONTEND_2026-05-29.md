# UPDATES_REVIEW_FRONTEND_2026-05-29

Frontend + technical feasibility audit of the `/updates` daily briefing surface.

Audited: `site/src/app/updates/`, `site/src/components/updates/`, `site/scripts/build-feeds.mjs`, `site/scripts/build-search-index.mjs`, `site/src/data/updates/daily/2026-05-29.json`, `site/src/app/layout.tsx`.

---

## Current-state health

**What is working well.** The component architecture is coherent and genuinely capable. `DailyBriefing.tsx` orchestrates 14 sub-sections via an explicit render order, each sub-component returning null when its data is absent — a correct defensive pattern for a build with schema drift. `ArchiveList.tsx` is a complete, accessible client-side filter with ARIA live regions, empty-state messaging, and keyboard navigation. The build pipeline (feeds, Pagefind) is solid: RSS 2.0 + JSON Feed 1.1 are generated prebuild; Pagefind runs postbuild against the static export with `data-pagefind-body` scoping correctly applied. The `[date]` route generates per-page metadata (title, description) and per-page JSON-LD `NewsArticle` blocks.

**What is dead or duplicated.** `DailyBriefing.legacy.tsx` is a 2,200+ line file that is never imported by any route or component — it is dead code confirmed by grep (no import outside itself). It duplicates every utility function in `briefing/utils.ts` (`formatDateLabel`, `normalizeBand`, `deltaColor`, `formatIndex`, `extractDomain`) and the entire `resolveSlugHref` function, which also appears in `TopSignals.tsx`, `DailyBriefing.tsx`, and `briefing/OpeningQuestion.tsx` (four independent copies). `DailyQuestion.tsx` is commented out in `DailyBriefing.tsx` at line 44 and is either unused or still rendered somewhere — this is ambiguous from the file alone. The entity count in several hardcoded strings is "1,155" but `CLAUDE.md` documents 1,160.

**What is structurally missing.** The two most material gaps are: (1) no per-day OpenGraph/Twitter image — the `layout.tsx` `openGraph` block has no `images` array and `generateMetadata` in `[date]/page.tsx` never adds one, meaning every `/updates/<date>` shares the same zero-image card and cannot compete on social; (2) for 18 of 30 briefings (60%) `topSignals` is absent from the JSON, which silently renders `LeadSignalCard`, `BrutalInsightCard`, `HighCompassionContrast`, and `SignalStack` all as null — a large section of the page disappears without any fallback UI, yet the header still advertises them via the CTA buttons `#signals` and the `<Button href="#signals">Read today's brief</Button>`.

---

## Candidate improvements

### C1 — Delete DailyBriefing.legacy.tsx and consolidate resolveSlugHref

**Type:** Tech debt / cleanup

**Problem.** `site/src/components/updates/DailyBriefing.legacy.tsx` (2,200+ lines) is dead code — zero imports anywhere in the codebase. The slug-resolution helper `resolveSlugHref` is copy-pasted four times: `DailyBriefing.legacy.tsx:108`, `DailyBriefing.tsx:120`, `TopSignals.tsx:293`, `OpeningQuestion.tsx:45`. The same `SLUG_LOOKUP_KINDS`, `SLUG_LOOKUP_PREFIXES`, and `KIND_TO_INDEX_SLUG` constant blocks appear in each. The shared utilities (`formatDateLabel`, `normalizeBand`, etc.) already have a canonical home in `briefing/utils.ts` but are redeclared in `DailyBriefing.legacy.tsx` and partially in `DailyBriefing.tsx` itself.

**Proposed change.** Delete `DailyBriefing.legacy.tsx`. Move `resolveSlugHref` + its three lookup constants into `briefing/utils.ts` and export it. Remove the three inline copies in `DailyBriefing.tsx`, `TopSignals.tsx`, and `OpeningQuestion.tsx`, replacing each with the shared import. Also remove the four private redeclarations of `formatDateLabel`/`normalizeBand`/`deltaColor`/`formatIndex` in `DailyBriefing.tsx` (lines 58–88) — they are already exported from `briefing/utils.ts`.

**User/technical benefit.** Eliminates ~2,700 lines of dead and duplicated code. Single source of truth for slug resolution means a new entity kind (e.g., "hospital") is registered in one place. TypeScript can enforce the interface once. Build bundle stays the same (dead file is already tree-shaken); developer velocity improves.

**Independence-policy check.** Pure refactor, no data or scoring logic touched. Safe.

| Dimension | Score |
|---|---|
| Impact | 2 |
| Strategic Alignment | 2 |
| Learning Value | 1 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **7** |

---

### C2 — Per-day OpenGraph image generation

**Type:** Improvement (high leverage for shareability)

**Problem.** `site/src/app/layout.tsx` defines a global `openGraph` block with no `images` field. `generateMetadata` in `site/src/app/updates/[date]/page.tsx` (lines 17–34) returns title + description only — no `openGraph.images` array and no `twitter.images`. Every `/updates/2026-05-29` URL resolves to a blank social card. `/updates/page.tsx` (lines 11–21) has the same gap. This is the highest-leverage missing SEO/social feature for a "daily destination" product. No per-day OG image path exists anywhere in the codebase.

**Proposed change.** Static-export constraint rules out Next.js `opengraph-image.tsx` route-segments (those require a server). The correct pattern for a static export is to generate per-day PNG images as a prebuild script step and reference them in `generateMetadata`. Concretely: (a) add a `scripts/generate-og-images.mjs` prebuild script that renders a minimal Canvas/SVG template to `public/updates/og/<date>.png` using `@napi-rs/canvas` or a headless approach for each date in the manifest; (b) update `generateMetadata` in `[date]/page.tsx` to include `openGraph: { images: [{ url: '/updates/og/${date}.png', width: 1200, height: 630 }] }` and the matching `twitter: { images: ['/updates/og/${date}.png'] }`. The latest briefing (`/updates/page.tsx`) can use the latest date's image. The image template can be extremely simple: dark background, site name, date, headline (first 80 chars), score-change count — all text, all generated from JSON.

**User/technical benefit.** Every share of `/updates/<date>` on Twitter/LinkedIn/Slack gains a distinct, content-carrying card. This is the single largest shareability gap in the current implementation.

**Feasibility note.** On a static export the only dependency is a Node build-time canvas library. `@napi-rs/canvas` is the standard choice. OG image files for 30 existing briefings would total roughly 3–5 MB at 1200x630 PNG. Adding ~100 KB per briefing per day is operationally fine. The script can be made incremental (skip dates that already have an image). Alternatively, generate a single shared template image per week if per-day images are not worth the build complexity initially.

**Independence-policy check.** Images are generated from published data at build time. No payment or scoring logic involved. Safe.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |
| **Priority Score** | **11** |

---

### C3 — Canonical URL on /updates/[date] and missing canonical on /updates

**Type:** Fix (SEO, 1-hour)

**Problem.** `generateMetadata` in `site/src/app/updates/[date]/page.tsx` never sets `alternates.canonical`. The archive page (`site/src/app/updates/archive/page.tsx:16`) correctly sets one. `/updates/page.tsx` does not set a canonical either. Google must infer the canonical URL for every date page, which is unreliable when multiple representations are possible (trailing slash variants, query params). The `mainEntityOfPage` value in the JSON-LD block on `[date]/page.tsx` line 88 correctly uses `https://compassionbenchmark.com/updates/${date}` but the HTML `<link rel="canonical">` is absent.

**Proposed change.** In `generateMetadata` in `[date]/page.tsx`, add `alternates: { canonical: \`https://compassionbenchmark.com/updates/\${date}\` }` alongside the existing feed type alternates. In `updates/page.tsx`, add `alternates: { canonical: 'https://compassionbenchmark.com/updates' }`. Both are single-line additions.

**User/technical benefit.** Explicit canonicals prevent duplicate-content consolidation of date URLs. Directly supports Google News eligibility for `NewsArticle` markup already present.

**Independence-policy check.** No content change. Safe.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 1 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **11** |

---

### C4 — Empty render path when topSignals is absent (60% of briefings)

**Type:** Fix (user-visible rendering gap)

**Problem.** In 18 of 30 published briefings (confirmed by inspecting the manifest), `topSignals` is absent from the JSON. When this happens: `LeadSignalCard` returns null (line 15 of `LeadSignalCard.tsx`); `BrutalInsightCard` returns null (line 33); `HighCompassionContrast` returns null (line 29); `SignalStack` returns null (line 89). The `DailyBriefingHeader` CTA button `<Button href="#signals">Read today's brief</Button>` (`DailyBriefingHeader.tsx:122`) links to an anchor `#signals` that SignalStack renders as `id="signals"` — which does not exist when SignalStack returns null. The user clicking the hero CTA scrolls to nothing. On these briefings the page still renders `ScoreMovementDashboard` and `LegacyScoreChangesSection`, but the 17-section layout loses its top third without any state indication.

**Proposed change.** Two-part fix: (a) when `topSignals` is absent but `scoreChanges` is present, `LeadSignalCard` should fall back to synthesizing a lead from the highest-magnitude score change (same pattern already used in `TopSignals.tsx` `fallbackSignalsFromScoreChanges`, lines 337–359) — this is a small prop-drilling or utility extraction. (b) The `#signals` anchor CTA in `DailyBriefingHeader` should be conditional on signals being present, or point to `#score-changes-detail` when signals are absent. Alternatively, `SignalStack` should always render `id="signals"` on its wrapper `<section>` even when content is empty, and show a minimal state: "Signal stack not available for this briefing — see score movements below."

**User/technical benefit.** On 60% of current briefings, the hero CTA resolves correctly and the page has visible content in the top analysis zone. Fixes a trust-eroding dead link on the most prominent button.

**Independence-policy check.** Fallback logic derives from already-published score data. No new judgment introduced. Safe.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **12** |

---

### C5 — Heading hierarchy is broken across the briefing

**Type:** Fix (accessibility + SEO)

**Problem.** `DailyBriefingHeader.tsx:110` renders the page's sole `<h1>` ("Daily Briefing"). All subsequent section titles in `DailyBriefing.tsx` use `<h2>` in some places and have no heading in others. The specific problem is in `LegacyScoreChangesSection` (line 373): each score-change entity name is an `<h3>` but the section itself uses `SectionHead` which renders an `<h2>` — structurally correct. However, `FloorDesignationsPanel` at line 1060 renders its panel title as `<h2>` ("Composite scores resolving at zero") even though it is a subsection below the page `<h1>`, not a top-level section. More critically, `LeadSignalCard.tsx:78` renders the lead entity title as `<h2>` — which is correct — but the section's aria-label is "Lead signal" with no visible heading, making the `<h2>` the first heading the screen reader encounters after `<h1>`, which is correct structurally. The deeper issue: `SignalStack.tsx:101` renders `<h2 className="text-[1.25rem] font-bold">Signal stack</h2>` inside a `<section>` with `aria-label="Signal stack"` — the visible heading duplicates the aria-label, making VoiceOver announce "Signal stack, Signal stack region". All sections with `aria-label` should not also have a visible heading with the same text, or the heading should serve as the accessible name instead.

**Proposed change.** Audit each section component and choose one of: (a) use a visible `<h2>` as the section's accessible name and remove the `aria-label`; (b) if no visible heading, keep the `aria-label`. The `<section aria-label="...">` + `<h2>` same-text duplication should be resolved in `SignalStack.tsx`, `ScoreMovementDashboard.tsx`, `EvidenceLedger.tsx`, and `BoundaryWatch.tsx`. This is a grep-and-fix pass across 8 section components.

**User/technical benefit.** Correct heading tree improves screen-reader navigation and contributes to Google's understanding of briefing structure for `NewsArticle` eligibility.

**Independence-policy check.** Structural HTML only. Safe.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **9** |

---

### C6 — Pagefind metadata field `top-entities` uses pipe-delimited slugs, not readable text

**Type:** Improvement (search quality)

**Problem.** In `site/src/app/updates/[date]/page.tsx` lines 140–149, the `data-pagefind-meta` attribute encodes entity data as `top-entities:slug1|slug2|slug3`. Pagefind surfaces these verbatim in search results snippets. Users searching for "UnitedHealth" will not match a briefing where the slug is `unitedhealth-group` unless Pagefind happens to also find the text in the `data-pagefind-body` section. More practically: the metadata string is built from `topSignals` only (`u.topSignals.slice(0,5).map(s => s.title ?? s.slug)`). For the 60% of briefings with no `topSignals`, this field resolves to an empty string. The `score-changes-count` field is pulled from `u.pipeline?.scoreChanges` which is a count field in pipeline — but in `2026-05-29.json` the pipeline object has `{ entitiesScanned: 0, entitiesAssessed: 20, confirmations: 0 }` with no `scoreChanges` key, so this always renders as `0` on the most recent briefings, defeating its purpose.

**Proposed change.** (a) Source `top-entities` from `scoreChanges` entity names as a fallback when `topSignals` is absent: `(u.topSignals ?? u.scoreChanges ?? []).slice(0,5).map(s => s.title ?? s.entity ?? s.slug ?? '')`. (b) Source `score-changes-count` from `u.scoreChanges?.length` as a fallback when `u.pipeline?.scoreChanges` is absent. (c) Consider adding `entity-names` as a readable (non-slug) field for richer Pagefind snippets.

**User/technical benefit.** The archive search (`ArchiveSearch` component referencing Pagefind) returns correct results for entity searches on briefings that lack `topSignals`. Score-change count badges in search results correctly show the actual number.

**Independence-policy check.** No scoring logic change. Safe.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **11** |

---

### C7 — Hardcoded entity count "1,155" is stale across multiple files

**Type:** Fix (content accuracy)

**Problem.** The entity count "1,155" is hardcoded as a string in at least five locations: `updates/page.tsx:14` (metadata description), `[date]/page.tsx:27` (metadata description), `[date]/page.tsx:87` (JSON-LD description), `DailyBriefingHeader.tsx:30` (KPI fallback), `archive/page.tsx:46` and 120 (JSON-LD and prose). `CLAUDE.md` documents 1,160 entities (447 Fortune 500 + 193 countries + 21 US states + 50 AI labs + 50 robotics labs + 144 US cities + 250 global cities + 5 other = approx 1,160). The pipeline field `entitiesScanned` would be the right live source, but it is `0` in the most recent briefings (2026-05-29 pipeline: `{ entitiesScanned: 0, entitiesAssessed: 20 }`).

**Proposed change.** (a) Create a single constant `ENTITY_COUNT = 1160` in a shared location (e.g., `site/src/data/entities.ts` or a new `site/src/lib/constants.ts`) derived from the actual index data at build time, and reference it from all metadata and fallback strings. (b) Alternatively, generate this count in `build-manifest.mjs` and write it into `manifest.json` as a `totalEntityCount` field, then read from there. The immediate fix — changing every hardcoded "1,155" to "1,160" — takes 10 minutes and is the right short-term action.

**User/technical benefit.** Metadata descriptions and JSON-LD accuracy for Google; trust signal for readers who know the actual count.

**Independence-policy check.** No scoring logic change. Safe.

| Dimension | Score |
|---|---|
| Impact | 2 |
| Strategic Alignment | 3 |
| Learning Value | 1 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **9** |

---

## Priority ranking

| # | Candidate | Score | Effort |
|---|---|---|---|
| C4 | Empty render path when topSignals absent | 12 | Low |
| C2 | Per-day OpenGraph image generation | 11 | Medium |
| C3 | Canonical URL on date pages | 11 | Trivial |
| C6 | Pagefind metadata fallback for missing topSignals | 11 | Trivial |
| C5 | Heading hierarchy audit | 9 | Low |
| C7 | Stale entity count | 9 | Trivial |
| C1 | Delete legacy file + consolidate resolveSlugHref | 7 | Low |

## Cross-cutting feasibility notes

**What is cheap on a static export.** Canonical tags (C3), entity count constants (C7), and Pagefind metadata fixes (C6) are prebuild/build-time changes with zero runtime cost. The heading/ARIA audit (C5) and the null-state fix (C4) are component-level changes that do not touch the build pipeline.

**What is medium-effort on a static export.** OG image generation (C2) requires a Node canvas library in the build container. This is feasible but adds ~20–30 seconds to the build per new day (or batch-generate all history once). The `@napi-rs/canvas` or `sharp` approach works without a browser. Vercel's `og` library cannot be used here (server-side only), but it is not needed.

**What requires backend coordination.** Nothing in this report. All items are build-time or client-component changes. The one cross-cutting dependency is that the overnight digest script should be updated to consistently emit `topSignals` in the JSON (C4 is a frontend mitigation; the root fix is in the worker/digest pipeline).
