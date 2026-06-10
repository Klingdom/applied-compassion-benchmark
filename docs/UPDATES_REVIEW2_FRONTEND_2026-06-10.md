# UPDATES_REVIEW2_FRONTEND_2026-06-10

Second-round frontend/technical audit of the `/updates` daily briefing surface.
Audited against the Wave B shipped baseline as of 2026-06-10.

Files read:
- `site/src/components/updates/DailyBriefing.tsx` (1,746 lines)
- `site/src/components/updates/DailyBriefing.legacy.tsx` (2,166 lines)
- `site/src/components/updates/briefing/{ReadingProgress,BriefingJumpNav,CompletionBlock,StatOfTheDay,TodayInBrief,LeadSignalCard,ScoreMovementDashboard,ScoreMovementCard,BoundaryWatch,EvidenceLedger,SubscribeCTA,DailyBriefingHeader,utils}.tsx/.ts`
- `site/src/app/updates/{page,archive/page,[date]/page}.tsx`
- `site/src/app/layout.tsx`
- `site/src/app/globals.css`
- `site/scripts/build-feeds.mjs`, `build-search-index.mjs`, `build-entity-history.mjs`
- `site/src/data/updates/daily/2026-06-10.json`
- `site/public/data/history/alphabet.json`, `anthropic.json`
- `site/src/lib/entityHref.ts`
- `site/next.config.ts`, `site/package.json`

---

## Current-state health

Wave B shipped cleanly. The above-the-fold editorial cluster (StatOfTheDay + TodayInBrief), BriefingJumpNav with present-section gating, ReadingProgress bar, collapsible audit `<details>`, and CompletionBlock are all functioning. The section-reorder is correct; no dead in-page anchors were found.

Two pre-existing structural gaps remain unresolved: (1) `DailyBriefing.legacy.tsx` (2,166 lines) is still unimported dead code, and `resolveSlugHref` still has three live copies (`DailyBriefing.tsx:122`, `TopSignals.tsx:293`, `OpeningQuestion.tsx:45`) plus the dead copy in the legacy file. (2) The OG image slot is still empty: `generateMetadata` in `[date]/page.tsx` never sets `openGraph.images`, so every briefing URL shares the fallback card from `layout.tsx` which also has no image.

The per-entity history JSON at `site/public/data/history/<slug>.json` is now populated for hundreds of entities and provides a clean `events[]` array with `date`, `newComposite`, `delta`, and `band` fields — the prerequisite for sparklines is in place.

---

## Candidate improvements

### C1 — Static-export-safe per-day OG image generation

**Type:** New feature (deferred from Wave A)

**Problem (evidence).** `site/src/app/updates/[date]/page.tsx:63-75` — `generateMetadata` constructs complete `openGraph` and `twitter` metadata but never sets `openGraph.images` or `twitter.images`. `site/src/app/layout.tsx:8-40` also has no `openGraph.images`. The `twitter.card` is set to `"summary_large_image"` in both files, which promises a 1200x630 card to Twitter/X crawlers, but without an image URL the platform falls back to a generic thumbnail or blank card. Every `/updates/<date>` URL therefore shares the same zero-image appearance when shared socially.

`next.config.ts` sets `output: "export"`, which makes the Next.js built-in `ImageResponse` approach (`app/opengraph-image.tsx` with `generateImageMetadata`) unavailable at runtime — it requires a Node.js server. This is the reason the feature was deferred.

**Proposed change.** Add a prebuild script `site/scripts/build-og-images.mjs` that runs after `build-feeds.mjs` in the `prebuild` chain. For each date in the manifest, the script calls `@vercel/og` (or the underlying `satori` + `sharp` libraries, which are build-time-safe) to produce a 1200x630 PNG and writes it to `site/public/updates/og/<date>.png`. The image composition should include: briefing date (large), top lead headline (one line, truncated), and entity count. No network calls needed — all inputs come from the already-loaded daily JSON.

In `[date]/page.tsx:generateMetadata`, add:
```
openGraph: {
  ...existing fields,
  images: [{ url: `/updates/og/${date}.png`, width: 1200, height: 630 }],
},
twitter: {
  ...existing fields,
  images: [`/updates/og/${date}.png`],
},
```

`satori` is pure JS (no canvas/native deps), making it Docker-build-safe. `sharp` is already a common Node build dep. If neither is wanted, a lighter alternative is using `canvas` (npm) or writing a minimal SVG-to-PNG via `librsvg`. The OG image does not need to match the full site design — a clean text-heavy card with the dark theme palette is sufficient and faster to implement.

**Benefit.** Social previews become real cards instead of blank thumbnails. Measurable improvement in click-through when briefing links are shared. Unlocks the `summary_large_image` card format that was already declared but never fulfilled.

**Independence-policy check.** Image content is purely derived from the same briefing data already published. No new claims or editorial additions. Safe.

| Dimension | Score (1-5) |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |

**Priority = 4 + 4 + 2 + 4 − 3 − 2 = 9**

---

### C2 — Delete DailyBriefing.legacy.tsx and consolidate resolveSlugHref / formatDateLabel

**Type:** Tech debt

**Problem (evidence).** `DailyBriefing.legacy.tsx` is 2,166 lines and has zero imports anywhere in the codebase (confirmed by grep). It will never be executed. Beyond the dead file itself, `resolveSlugHref` — a 12-line function with three 7-entry lookup constants (SLUG_LOOKUP_KINDS, SLUG_LOOKUP_PREFIXES, KIND_TO_INDEX_SLUG) — exists in three live locations:

- `DailyBriefing.tsx:93-134` (comment says "for legacy sub-components below" but the sub-components it serves — ForwardSignalsList and EmergingRisksSection — are defined in the same file and could simply import from utils)
- `TopSignals.tsx:293-307` (different return type: includes `entity` object)
- `briefing/OpeningQuestion.tsx:45-57`

Additionally, `DailyBriefing.tsx:58-88` re-declares `normalizeBand`, `deltaColor`, `formatIndex` which are already exported from `briefing/utils.ts`. The canonical `formatDateLabel` in `briefing/utils.ts:6-10` is reimplemented (identically) in: `DailyBriefing.tsx:87-91`, `DailyBriefing.legacy.tsx`, `site/scripts/build-feeds.mjs:182-186`, and indirectly exported from `DailyBriefing.tsx` as a public export (`export function formatDateLabel`), creating an odd dual-source situation where the page imports it from the component file rather than from lib/utils.

**Proposed change.** (1) Delete `DailyBriefing.legacy.tsx`. (2) Move `resolveSlugHref` + its three constants into `briefing/utils.ts`, export it. Remove the inline copies from `DailyBriefing.tsx`, `OpeningQuestion.tsx`. The `TopSignals.tsx` variant adds an `entity` field to the return; keep a separate `resolveSlugHrefWithEntity` there or refactor the call site. (3) Delete the private re-declarations in `DailyBriefing.tsx:58-88` and import from `briefing/utils.ts`. (4) Move the `formatDateLabel` export to `briefing/utils.ts` only and update the import in `page.tsx` and `updates/page.tsx`.

**Benefit.** ~2,700 lines removed. Single source of truth for slug resolution — when a new entity kind is added, one file changes instead of three. TypeScript can enforce the interface. Developer cognitive load reduced. No behavioral change.

**Independence-policy check.** Pure refactor. Safe.

| Dimension | Score (1-5) |
|---|---|
| Impact | 2 |
| Strategic Alignment | 2 |
| Learning Value | 1 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |

**Priority = 2 + 2 + 1 + 5 − 2 − 1 = 7**

---

### C3 — Score sparklines on entity history pages (cheap path from existing data)

**Type:** New feature

**Problem (evidence).** `site/public/data/history/<slug>.json` exists for hundreds of entities, each with an `events[]` array containing `date`, `newComposite`, `delta`, and `newBand` fields (confirmed in `alphabet.json`, `anthropic.json`). The `EntityDetail` component (`site/src/components/entity/EntityDetail.tsx`) currently shows a "View score history" link (`historyHref` prop) and an `EntityEvidenceCard`, but renders no visual score trajectory. A reader cannot see at a glance whether an entity is trending up, down, or flat across the assessment cycle.

The `EntityEvidenceCard` is already fed from the same history data pipeline. The build step `build-entity-history.mjs` already produces `latestScoreChange`, `daysSinceLastChange`, and `tierCounts` alongside the full `events` array. No new data infrastructure is required.

**Proposed change.** Add a server component `site/src/components/entity/ScoreSparkline.tsx`. It accepts an `events` array (typed, not `any[]`), filters to events where `newComposite` is non-null, and renders a minimal inline SVG sparkline: a polyline of (date, composite) points scaled to a 120x32px viewBox. Points are purely server-computed from static data — no client JS needed, no charting library. Color the line using the `deltaColor` helper: green if the last delta is positive, red if negative, neutral otherwise. Optionally annotate the first and last points with `<title>` for screen readers.

On the `EntityDetail` page, render the sparkline between the current composite score display and the "View score history" link. Constrain to events with `type === "scored"` and `newComposite !== null` to avoid rendering flat lines for entities with only boundary-watch entries.

This is the cheapest path: zero new npm dependencies, ~60 lines of SVG math, fully static. The alternative (a client-side chart library like Recharts or Chart.js) would add 40-80kB to the entity page bundle for something that can be accomplished with 8 SVG data points.

**Benefit.** Visible score trajectory on every entity page that has history. Differentiates the entity pages from flat scorecards. Supports the "daily briefing links to entity page" flow: a reader who clicks through from a score movement now sees the history at a glance. No bundle cost.

**Independence-policy check.** Visual display of existing scored data only. No new assessments, no editorial additions. Safe.

| Dimension | Score (1-5) |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority = 3 + 4 + 3 + 4 − 2 − 1 = 11**

---

### C4 — Accessibility: reduced-motion respect for ReadingProgress and JumpNav transitions

**Type:** Improvement (accessibility)

**Problem (evidence).** `site/src/components/updates/briefing/ReadingProgress.tsx:43` uses `transition-[width] duration-75 ease-linear` on the progress bar fill. `site/src/components/updates/briefing/BriefingJumpNav.tsx` (no animation), but the progress bar animates every scroll event. `site/src/app/globals.css:22` sets `html { scroll-behavior: smooth; }` globally with no `@media (prefers-reduced-motion: reduce)` override.

For users with vestibular disorders or motion sensitivity (covered by WCAG 2.2 SC 2.3.3, AAA, and the broader SC 1.4.3 spirit), a progress bar that animates on every scroll event is a persistent source of motion stimulus. The global `scroll-behavior: smooth` compounds this on every in-page anchor jump (of which there are 7-9 per briefing via the JumpNav).

Additionally, the `<details>` chevron in `DailyBriefing.tsx:346-363` uses `transition-transform group-open:rotate-90`. This is a minor animation but should also respect the motion preference.

**Proposed change.** (1) In `globals.css`, wrap `scroll-behavior: smooth` in a `@media (prefers-reduced-motion: no-preference)` block. (2) In `ReadingProgress.tsx`, add a `useReducedMotion` hook (a 3-line hook using `window.matchMedia`) and set `transitionDuration: '0ms'` on the progress fill when `prefersReducedMotion` is true, or stop rendering the component entirely (since it is purely decorative). (3) In `DailyBriefing.tsx:346`, replace the bare `transition-transform` class with `motion-safe:transition-transform` (Tailwind's built-in reduced-motion utility). These are targeted, self-contained changes.

**Benefit.** WCAG 2.2 conformance at AA level for motion. Protects users with vestibular disorders. Zero user-visible regression for users who have not opted into reduced motion.

**Independence-policy check.** Accessibility improvement only. Safe.

| Dimension | Score (1-5) |
|---|---|
| Impact | 2 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |

**Priority = 2 + 3 + 2 + 5 − 1 − 1 = 10**

---

### C5 — Richer JSON-LD: score-movement ItemList and BreadcrumbList

**Type:** Improvement (structured data / SEO)

**Problem (evidence).** `site/src/app/updates/[date]/page.tsx:109-132` emits a `NewsArticle` JSON-LD block with `headline`, `datePublished`, `dateModified`, `author`, `publisher`, and `description`. This is minimal and correct, but misses two high-value structured-data patterns that are directly supported by the briefing data shape:

1. **`ItemList` of score movements.** The `recentAssessments` or `scoreChanges` arrays in the briefing JSON are a natural `ItemList` — each entry has a name (`entity`), a URL (`entityHref(index, slug)`), and a numeric value (`assessedScore`). Google's structured data documentation supports `ItemList` alongside `NewsArticle` in the same page. For briefings with score changes (most of the archive), this would surface entities in rich search results.

2. **`BreadcrumbList`.** Every `/updates/<date>` page sits at depth 2 (Home > Daily Briefing > [Date]). A `BreadcrumbList` block is a 10-line addition and is a baseline SEO expectation for paginated/archived content. The archive page already emits `Dataset` JSON-LD but does not include a `BreadcrumbList` for its own breadcrumb UI element.

**Proposed change.** In `[date]/page.tsx`, extend the JSON-LD `<script>` block to a JSON-LD array (or add a second `<script>` block) with:
- A `BreadcrumbList` for `Home > Daily Briefing > [Date Label]`
- An `ItemList` derived from `u.recentAssessments` (or `u.scoreChanges` as fallback), with each `ListItem` mapping to `{ "@type": "ListItem", position: i+1, name: entity, url: canonicalUrl + '#' + slug }`. Cap at 10 items to avoid over-long structured data.

The existing `NewsArticle` block incorrectly uses `u.scoreChanges?.[0]?.headline` as `headline` — on the 2026-06-10 briefing (a confirmation-only cycle), `scoreChanges` is empty and the fallback is the full 380-word `headline` field from the JSON (`u.scoreChanges?.[0]?.headline ?? \`Compassion Benchmark Daily Briefing — ${date}\``). That fallback is correct, but note the `u.headline` field exists and is often a shorter, more appropriate string. Consider using `u.topSignals?.[0]?.title ?? u.headline ?? fallback` to prefer the tightest available headline.

**Benefit.** Richer search result appearances. `ItemList` can drive entity chips in Google News and Discover. `BreadcrumbList` improves navigation appearance in SERPs. Zero runtime cost — all static JSON in the HTML.

**Independence-policy check.** Exposes the same data already published in the HTML. No new editorial claims. Safe.

| Dimension | Score (1-5) |
|---|---|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority = 3 + 3 + 2 + 4 − 2 − 1 = 9**

---

### C6 — JS budget: StatOfTheDay copy button is the only `"use client"` component above the fold; split it

**Type:** Improvement (performance)

**Problem (evidence).** `site/src/components/updates/briefing/StatOfTheDay.tsx:1` is `"use client"`. It is imported by `DailyBriefingHeader.tsx` which is imported by `DailyBriefing.tsx`, which is a server component. This forces `StatOfTheDayCard` to hydrate as a client component on every briefing page load. The component's only interactive behavior is the copy-to-clipboard button (`handleCopy` on lines 32-39), which requires `useState` (one bit of state: copied/not-copied) and `navigator.clipboard`.

The hero number, label, entity name, and entity link are all static and could be rendered server-side. The clipboard button is the only reason this is a client component. The same pattern holds: a large visual block is made interactive only by a small action button.

`TodayInBrief.tsx` and `DailyBriefingHeader.tsx` are correctly server components. The asymmetry means `StatOfTheDay` pulls a React hydration chunk into the above-the-fold render path unnecessarily.

**Proposed change.** Split `StatOfTheDayCard` into two parts: a server component `StatOfTheDayDisplay` that renders the hero number, label, entity link (no state), and a separate `CopyCitationButton.tsx` (client component) that receives only the `citation` string and handles the copy interaction. `DailyBriefingHeader` renders `StatOfTheDayDisplay` with `CopyCitationButton` nested inside it. The client boundary drops from the full card to a single small button element.

The practical impact on a static-export site (Next.js `output: "export"`) is modest — there is no streaming SSR, so the hydration happens synchronously after parse regardless. But the pattern is cleaner: smaller client components are easier to test and review, and if the architecture ever moves toward partial hydration or streaming, the split is already done.

**Benefit.** Cleaner component boundary. Slightly smaller hydration surface. The pattern is easier to replicate for other "mostly static + small action button" components. Low risk, low effort.

**Independence-policy check.** Pure refactor. Safe.

| Dimension | Score (1-5) |
|---|---|
| Impact | 1 |
| Strategic Alignment | 2 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |

**Priority = 1 + 2 + 3 + 5 − 1 − 1 = 9**

---

### C7 — BriefingJumpNav IntersectionObserver dependency array bug

**Type:** Bug fix

**Problem (evidence).** `site/src/components/updates/briefing/BriefingJumpNav.tsx:34-75` — the `useEffect` hook that wires the `IntersectionObserver` has an empty dependency array (`// eslint-disable-next-line react-hooks/exhaustive-deps` on line 74) while using `presentSections` from props in the effect body (line 38: `presentSections.map(...)`, line 55: `presentSections.map(...)`).

This means: if `presentSections` changes between renders (e.g., if the briefing component is ever unmounted and remounted with different data, or if the nav is used in a context where `presentSections` can change), the observer will never re-register. In the current usage — where `presentSections` is computed once from static build-time data and never changes after mount — this is harmless. But the eslint suppression comment signals the known violation.

More concretely: the `visibleSet` accumulator (line 47) is a `Set` captured in the closure at mount time. If a target element is removed and re-added to the DOM (e.g., after a React re-render that unmounts a section due to a data change), the removed element stays in `visibleSet` indefinitely because the `disconnect()` cleanup would not reconnect the new element. In the current static-data build this cannot happen, but it will misfire if any briefing component is ever wrapped in a conditional that can toggle.

**Proposed change.** (1) Replace the `// eslint-disable-next-line` suppression with a proper dependency. Either: include `presentSections` in the dependency array and use a deep-equality memo (`useMemo` on the sections array in the parent, or compare by `.map(s => s.id).join(',')` as a stable key), or convert `presentSections` to a ref (`const sectionsRef = useRef(presentSections)`) inside the effect. (2) Separately, convert `visibleSet` from a closure-captured `Set` to a `ref.current` to survive re-renders safely. This is a 5-line change.

**Benefit.** Eliminates a latent stale-closure bug. Removes the eslint suppression (a maintenance smell). Safe in the current static-build context; correct in any future dynamic usage.

**Independence-policy check.** Bug fix in client-only navigation logic. Safe.

| Dimension | Score (1-5) |
|---|---|
| Impact | 2 |
| Strategic Alignment | 2 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |

**Priority = 2 + 2 + 3 + 5 − 1 − 1 = 10**

---

## Priority ranking summary

| # | Candidate | Priority |
|---|---|---|
| C3 | Score sparklines from entity history JSON | 11 |
| C4 | Reduced-motion for ReadingProgress + global scroll-behavior | 10 |
| C7 | BriefingJumpNav IntersectionObserver dependency array bug | 10 |
| C1 | Per-day OG image generation (static-export-safe) | 9 |
| C5 | Richer JSON-LD: ItemList + BreadcrumbList | 9 |
| C6 | Split StatOfTheDay client boundary to CopyCitationButton only | 9 |
| C2 | Delete legacy file + consolidate resolveSlugHref | 7 |

**Cheap-vs-expensive callout:**
- C4 (reduced-motion) and C7 (observer bug) are the highest confidence/lowest effort items — each is 5-10 lines, zero API risk, and closes a real correctness gap.
- C3 (sparklines) is the highest-priority new feature: all prerequisite data exists, no new npm dependencies, ~60 lines of SVG math.
- C1 (OG images) is the most strategically visible but requires a new build-time dependency (satori/sharp) and a new prebuild script — real effort, real build-time cost, but the payoff is measurable via social traffic.
- C2 (dead code removal) should be done but has the lowest urgency — it has zero user-visible effect.
