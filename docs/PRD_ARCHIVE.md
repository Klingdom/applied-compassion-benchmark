# PRD: Daily Research Archive System

**Version:** 1.0
**Date:** 2026-05-25
**Owner:** Product
**Status:** Ready for architecture + engineering handoff
**Downstream consumers:** system-architect, frontend-engineer, analytics

---

## 0. Current state

| Surface | State |
|---|---|
| `/updates` | Shows latest briefing. Date nav exposes last 5 dates only. |
| `/updates/[date]` | 42 static pages pre-rendered from manifest. Discoverable only via date nav or direct URL. |
| Date navigation | 5-date dropdown. No path to dates older than 5 days. |
| Entity-level history | `entityChanges.ts` builds a build-time map of most-recent changes only — not all changes. |
| Search | None. No client-side or server-side search across briefing content. |
| Feed | No RSS, no JSON feed, no Atom. |
| Archive landing | No `/updates/archive` or equivalent index page. |
| SEO indexability | 42 date pages exist and are structurally indexed. Content is not discoverable by topic, entity, or sector. |

---

## 1. Problem statement

### Who has the problem

Policy researchers, journalists, NGO analysts, AI safety staff, and government-affairs teams who arrive at Compassion Benchmark after a news event and need to find all historical evidence for a specific entity, date range, or sector.

### What the pain is

The archive is opaque. A researcher who finds the site after the Turkey democratic crisis cannot navigate backward to find the May 21 first assessment, the May 23 apply, or the May 24 second apply without knowing the exact dates. An AI safety analyst tracking Anthropic cannot see the boundary-watch history over seven consecutive cycles. A journalist writing a retrospective on Slovakia's descent from 44.6 to 31.6 in three days has no way to discover that arc from the site — they would need to receive those exact date URLs out-of-band.

This is not a content gap. The content exists: 42 briefings, ~20 assessments per day, full topSignals, boundaryWatch, and recentAssessments fields in each JSON. The gap is navigation and surface.

### What the job is

Researchers and journalists need to find, browse, and cite the institution's historical record of evidence-linked assessments. This job cannot be done today.

### Why now

42 briefings means the archive is large enough that the gap is painful. At 6 months, 125+ briefings, the problem compounds geometrically. The structural SEO opportunity (entity-name + score queries, country + AI lab governance queries) grows with every briefing published and is currently unrealized because deep archive pages are not internally linked. The evidence chain that supports research-asset monetization (reports, certified assessments) depends on the public record being citable and navigable.

---

## 2. Strategic importance

### Institutional credibility

A benchmark institution that cannot show its work over time is not credible to institutional buyers. Policy teams and journalists who evaluate the institution's independence need to see a navigable, datable, evidence-linked record — not just today's findings. The archive is the institution's primary credibility surface.

### SEO compounding

Each daily briefing contains entity names, country names, score values, and methodology terms that are targets for long-tail search (e.g., "Anthropic safety score 2026," "Turkey democratic crisis benchmark," "Slovakia EU conditionality ruling"). None of these searches surface the relevant archive pages because those pages are not internally linked. Archive landing + entity history pages create the internal link graph that enables index-crawl amplification across 42+ rich content pages.

### Evidence chain for monetization

Score-Watch alerts cite change proposals. Certified assessments cite the research record. Sector deep-dive reports cite dated assessment findings. All of these are more valuable and more defensible when buyers can verify the evidence chain themselves by navigating to the specific briefing that generated the change. An opaque archive is a monetization ceiling.

### Research asset differentiation

No other benchmark institution publishes a daily scored research record at this granularity. An accessible, searchable, citable archive is the institutional moat. Competitors can copy a score table; they cannot retroactively produce 42 dated, evidence-linked assessment cycles.

---

## 3. Users and buyers

### Primary users (no purchase required)

**Persona A — Policy Researcher**
Goal: Find all benchmark assessments of a specific entity (e.g., Slovakia, Anthropic) over time to understand the score trajectory and the evidence that drove it.
Context: Arrives from a news event or a colleague citation. Knows the entity name; does not know the date of the relevant assessment.
Pain: Cannot discover assessments except by guessing dates. No search. No entity history page.

**Persona B — Journalist / Editor**
Goal: Cite a specific score change with a date-stamped source URL for a story deadline.
Context: Knows approximately when the change happened but needs to verify the exact date, delta, and primary evidence cited.
Pain: Cannot verify without an out-of-band tip or brute-force URL guessing. Citability requires a stable, discoverable URL.

**Persona C — AI Safety Analyst**
Goal: Trace all benchmark entries mentioning a specific AI lab (e.g., Anthropic, xAI, OpenAI) across the full archive to understand how the institution has applied its methodology to that sector.
Context: Evaluating the institution's consistency and depth for a comparative research project. Needs to find all briefings where an AI lab was assessed, not just the days where a score changed.
Pain: No search or entity-filter on the archive. Must read 42 individual briefing pages to extract this.

**Persona D — Score-Watch Subscriber (existing buyer)**
Goal: Browse the complete assessment history for the entity they are watching, especially the series of events leading up to the most recent score change.
Context: Received an alert that Slovakia moved from 33.6 to 31.6. Wants to understand the prior -5.5 apply on May 22, and the original baseline. Has a Gumroad subscription; not seeking a new purchase.
Pain: Received the alert but cannot navigate to the full history from the alert link. The alert links to the entity detail page, not to the archive of prior assessments.

**Persona E — SEO bot / crawler (non-human)**
Goal: Index the content of dated archive pages to surface them for entity-name and topic queries.
Context: Currently finds 42 pre-rendered pages but has no internal link graph pointing to them except the 5-date dropdown. No sitemap priority signals for archive pages. No feed to trigger recrawl on new content.
Pain: Archive pages exist but are orphaned from a link-graph perspective. RSS/JSON feed would signal new content daily.

### Secondary users (potential buyers)

**Persona F — Government-Affairs Professional**
Goal: Monitor a portfolio of entities (foreign governments, AI labs, specific Fortune 500 companies) and locate historical context quickly when a client needs briefing.
Context: Pays for Score-Watch on 3-5 entities. The archive is supplementary context, not the primary alert mechanism.
Pain: Alert is useful; historical trajectory requires archive access that currently does not exist in navigable form.

---

## 4. MVP scope

### Must-have (ships together as Archive MVP)

**4.1 Archive landing page** (`/updates/archive`)

A browsable, statically-rendered index of all published briefings in reverse-chronological order.

Each entry shows:
- Date (formatted, e.g., "May 25, 2026")
- Score change count for the day (from `pipeline.scoreChanges`)
- Entities assessed count (from `pipeline.entitiesAssessed`)
- Headline text (first sentence of the briefing `headline` field, truncated)
- Link to the `/updates/[date]` page

Grouped by month. Navigable by month anchor or simple month filter.

No pagination required if all 42 entries fit on one page (they do). Design for eventual growth to 200+ entries; month grouping solves this without pagination complexity.

**4.2 Per-entity history page** (`/entity/[index]/[slug]/history`)

A statically-rendered page showing every briefing entry in which a specific entity appeared, across the full archive.

Each entry shows:
- Date
- Assessment status (applied / documented / boundary-watch / floor-confirmed)
- Score on that date (published and assessed, if different)
- Delta (if score change occurred on that date)
- `whyHeadline` from the `recentAssessments` array for that entity on that date
- Link to the full briefing date page

Data source: iterate all 42 daily JSON files at build time; extract all `recentAssessments` entries where `slug` matches the entity.

Sorted: most recent first. No pagination required for current volume; design handles 200+ entries.

Entry point: link from existing entity detail pages ("View full assessment history").

**4.3 Client-side search** (`/updates/search` or embedded in `/updates/archive`)

A static page with client-side JavaScript search across all briefing headlines, entity names, and `whyHeadline` strings in the archive.

Search index is a pre-built JSON file generated at build time, containing all searchable text with date and entity references. This file is fetched once by the search page; no server required.

Minimum viable search behavior:
- Query string matches against: briefing headline, topSignals titles, topSignals descriptions (truncated), recentAssessments whyHeadline, entity names
- Results show: matched date, matched entity (if entity search), snippet with matched term highlighted, link to the full briefing page
- No search if query is fewer than 3 characters
- Results must render within 300ms of user input on the pre-built index

**4.4 RSS feed and JSON feed**

Two static files generated at build time and served from the `public/` directory:

`/updates/feed.xml` — RSS 2.0 feed
- One item per published briefing
- Item title: briefing title field
- Item link: `https://compassionbenchmark.com/updates/[date]`
- Item description: briefing summary field (first 400 characters)
- Item pubDate: date field
- Channel: max 42 items (full archive); no truncation

`/updates/feed.json` — JSON Feed 1.1
- Same content as RSS but in JSON Feed format for programmatic consumers
- Additional fields: `pipeline.scoreChanges` count, top entity slugs affected (from topSignals), per the JSON Feed spec's `_extensions` convention

Both files must be regenerated on every build (not just when new briefings are added).

RSS autodiscovery `<link>` tag must be present in the `<head>` of `/updates` and `/updates/[date]`.

### Should wait (not in MVP)

**4.5 Sector / index filter on archive landing**

Filter the archive landing by sector (Countries, Fortune 500, AI Labs, etc.). Useful but adds UI complexity. The raw archive landing already makes content discoverable; sector filter is an enhancement.

Ship after MVP; validate that archive landing is being used before adding filter complexity.

**4.6 Calendar view of archive**

A month-calendar-style view showing which dates have briefings. Visual but not functionally superior to the month-grouped list for the use cases defined. Not in MVP.

**4.7 Full-text search with excerpt highlighting across assessment MD files**

The `research/assessments/<date>/<slug>.md` files are internal research artifacts, not public JSON. Indexing them for public search would require a pipeline change and a disclosure policy decision. Not in MVP; internal use only until explicitly scoped.

**4.8 Entity comparison view**

Side-by-side score trajectory for two or more entities. Useful for journalists writing comparative analysis. Requires chart components and is a distinct product surface. Not in MVP.

**4.9 Methodology ruling index**

A cross-referenced index of all methodology rulings established across briefings (e.g., "Tier-1.5 EU Parliamentary Conditionality — Ruling 5, May 25"). Extractable from `methodologyNotes` fields. Valuable for institutional credibility but not required for the core navigation use case. Backlog item.

### Explicitly excluded (out of scope)

- Paid archive or paywalled history: archive is free and public. Commercial value flows through Score-Watch, research assets, and certified assessments — not through archive access restrictions.
- Internal CMS for editing or authoring briefings: briefings are produced by the research pipeline, not the site. No CMS required.
- Redesign of the `/updates` landing page: the current landing page design is not in scope. Archive MVP adds new pages and routes; it does not alter the existing updates page.
- Account systems, saved searches, or personalized views: static export constraint makes these infeasible without external infrastructure. Not in MVP.
- Comments or community annotation: no social layer. Not in scope.
- Server-side search (Elasticsearch, Algolia, etc.): static export is the architectural constraint. Client-side only.
- Paid API access to archive data: P2 monetization item, scoped separately.
- Backfill of missing weekday dates: 42 briefings span April 15 – May 25, 2026. Several weekday dates appear missing (weekends are expected gaps; any missing weekdays are a pipeline gap, not an archive gap). The archive system shows what exists; it does not fill gaps.
- Archive of internal research artifacts (`research/assessments/`, `research/change-proposals/`, `research/digests/`): these are internal pipeline outputs. Not surfaced publicly in this PRD.

---

## 5. User stories and acceptance criteria

### Story 1: Researcher finding all assessments of a specific entity

**As a policy researcher,** I want to go to Slovakia's entity page and find a link to its complete assessment history so that I can read every benchmark entry about Slovakia in chronological order.

**Acceptance criteria:**

- [ ] The entity detail page for any entity that appears in at least one daily briefing `recentAssessments` array shows a "View full assessment history" link.
- [ ] That link navigates to `/entity/[index]/[slug]/history` (e.g., `/entity/countries/slovakia/history`).
- [ ] The history page lists every briefing entry for that entity, most-recent first.
- [ ] Each entry shows: date (formatted), assessment status label, published score, delta (if non-zero), and the `whyHeadline` string.
- [ ] Each entry links to the full briefing at `/updates/[date]`.
- [ ] If an entity has zero briefing entries (never appeared in `recentAssessments`), the entity detail page does not show the history link.
- [ ] History page is statically rendered at build time; no client-side data fetching on load.
- [ ] History page includes entity name and index name in the `<title>` and the `<h1>`.

**Edge cases:**
- Entity appears in briefings but always with delta 0 (documented holds): all entries are listed; delta field shows "0.0" or "—" (not blank).
- Entity appears in only one briefing: history page shows a single entry; no "no history" error state.
- Entity has never appeared in any briefing: history page route does not exist (returns 404 via `generateStaticParams`); entity detail page does not link to it.

---

### Story 2: Journalist citing a specific historical score change

**As a journalist,** I want to search for "Slovakia" in the archive and find the May 22 briefing where the score dropped -5.5 so that I can link to a stable, date-stamped URL as a citation in my story.

**Acceptance criteria:**

- [ ] Typing "Slovakia" into the archive search returns results from multiple briefing dates.
- [ ] Each result shows the briefing date, a text snippet containing the matched term, and a direct link to `/updates/[date]`.
- [ ] The URL `/updates/2026-05-22` is a stable, pre-rendered page that exists and loads without a server (static).
- [ ] Search results are ordered by relevance (exact entity name match above partial text match) then by date (most recent first within the same relevance tier).
- [ ] Clicking a search result link navigates to the correct date page.
- [ ] Search results include a snippet from the `whyHeadline` or `topSignals.description` field that contains the matched term.

**Edge cases:**
- Query matches multiple entity names (e.g., "Turkey" matches Turkey and Turks Caicos): all matching entity results from all dates are returned; no deduplication by entity.
- Query matches only briefing headlines, not entity names: headline-matched results are returned with lower rank than entity-name matches.
- Query has zero results: a "no results" message is shown with a suggestion to try the archive index.
- Query is 1-2 characters: search does not execute; prompt shows "Enter at least 3 characters."

---

### Story 3: AI safety analyst tracing all Anthropic entries

**As an AI safety analyst,** I want to see every day that Anthropic appeared in the Compassion Benchmark research cycle — not just the days where its score changed — so that I can evaluate the consistency of the methodology applied to AI labs.

**Acceptance criteria:**

- [ ] Anthropic's entity history page (`/entity/ai-labs/anthropic/history`) lists all 7+ briefing entries where Anthropic appeared in `recentAssessments`, including entries with delta 0.
- [ ] The `status` field is visible on each entry (e.g., "boundary-watch", "documented") so the analyst can see the distinction between assessed holds and applied changes.
- [ ] The history page title and metadata identify this as the Compassion Benchmark assessment record for Anthropic.
- [ ] The `nextForwardSignal` field (if present in the assessment entry) is visible on the history page so the analyst can see what the institution was watching.
- [ ] The archive search for "Anthropic" returns all briefing dates where Anthropic appeared in `topSignals` or `recentAssessments`, including dates where it was assessed but had no score change.

**Edge cases:**
- Anthropic appears in `boundaryWatch` but not `recentAssessments` on a given date: that date is still included in the history if the `boundaryWatch` entry references the slug. (Note: this requires the history page data extraction to also scan `boundaryWatch`, not only `recentAssessments`.)
- Analyst navigates to the history page directly from a search engine (not from the entity detail page): the page is fully self-contained with entity name, index, and back-navigation to the entity detail page.

---

### Story 4: Score-Watch subscriber browsing their entity's history

**As a Score-Watch subscriber who received an alert that Slovakia moved from 33.6 to 31.6,** I want to find the full timeline of Slovakia's score changes so that I can understand the trajectory before the most recent alert.

**Acceptance criteria:**

- [ ] The alert email links to Slovakia's entity detail page.
- [ ] The entity detail page has a visible "View full assessment history" link that leads to the history page.
- [ ] The history page shows prior entries including the May 22 -5.5 apply, so the subscriber can see the two-event arc in one view.
- [ ] The history page is accessible without login or purchase.
- [ ] The most recent entry on the history page matches the score shown in the alert email (no staleness).

**Edge cases:**
- Subscriber's entity has received a score change but has only one history entry (this was its first assessment): history page shows one entry; no error.
- Subscriber visits history page the morning of a new change before the next build: the page reflects the prior build state. This is acceptable and expected for a static site. No acceptance criteria around real-time freshness.

---

### Story 5: SEO crawler discovering archive content

**As a search engine crawler,** I want to find the RSS feed, a sitemap-linked archive index page, and internal links from entity pages to their history pages so that I can index the full scope of Compassion Benchmark's research record.

**Acceptance criteria:**

- [ ] `/updates/feed.xml` is a valid RSS 2.0 document containing one item per published briefing.
- [ ] `/updates/feed.json` is a valid JSON Feed 1.1 document with the same coverage.
- [ ] RSS autodiscovery `<link rel="alternate" type="application/rss+xml">` is present in the `<head>` of `/updates` and all `/updates/[date]` pages.
- [ ] `/updates/archive` is internally linked from the `/updates` landing page (e.g., "View full archive").
- [ ] Every entity history page (`/entity/[index]/[slug]/history`) is internally linked from the corresponding entity detail page.
- [ ] The archive landing page (`/updates/archive`) links to every date page in the manifest.
- [ ] All new static routes are included in the Next.js static export (verifiable: all expected files exist in `out/` after `npm run build`).

**Edge cases:**
- Feed contains a briefing with an unusually long `headline` field: feed item titles must be truncated at 200 characters to remain valid RSS.
- Build runs before a new briefing JSON is added to the manifest: feed reflects only briefings in the manifest; no dangling references.

---

### Story 6: Archive visitor browsing by month

**As a first-time visitor arriving at the archive landing page,** I want to quickly see how many briefings exist and browse by month so that I understand the scope of the institution's research record.

**Acceptance criteria:**

- [ ] The archive landing page shows all briefing dates grouped by month (e.g., "May 2026 — 19 briefings", "April 2026 — 13 briefings").
- [ ] Each month group is expanded by default (no collapsed state in MVP).
- [ ] Each entry in a month group shows: date, score change count, entities assessed count, and a 1-sentence headline excerpt (truncated at 120 characters with ellipsis).
- [ ] The total briefing count is displayed in the page header (e.g., "42 briefings published").
- [ ] The page links to the `/updates` landing for the latest briefing and includes a back-link from `/updates` to `/updates/archive`.
- [ ] The page is statically rendered; all data is from the manifest and daily JSON files at build time.

**Edge cases:**
- A month has only 1 briefing (possible if archive launches mid-month): single-entry month group is shown without special treatment.
- Archive landing is accessed with no briefings in the manifest: empty state shows "No briefings published yet." (defensive; unlikely in practice.)

---

## 6. Success metrics

### Primary KPIs

| Metric | Baseline (today) | Target (90 days post-launch) | Measurement |
|---|---|---|---|
| Archive page views per session | 0 (no archive landing exists) | ≥ 1.8 pages/session among sessions that visit `/updates/archive` | Umami: page views in sessions containing `/updates/archive` |
| Deep archive page entry rate from search engines | ~0% (archive pages orphaned) | ≥ 15% of `/updates/[date]` page views arrive from organic search | Umami referrer data or GA referrer on archive date pages |
| Entity history page views | 0 (no history pages exist) | ≥ 200 unique page views/month across all history pages | Umami: `/entity/*/history` page view count |
| Time on page — `/updates/[date]` | No clean baseline (conflated with landing page) | ≥ 3 min average for sessions arriving from archive landing or search | Umami session duration on `/updates/[date]` |
| RSS feed subscriber count | 0 (no feed exists) | ≥ 25 unique feed readers subscribed | Feed reader pings or Cloudflare access log hits on `/updates/feed.xml` |
| External citations linking to `/updates/[date]` URLs | No tracked baseline | ≥ 5 external links to archive pages within 90 days | Ahrefs or Search Console inbound link report |

### Leading indicators (first 30 days)

- Number of entity history pages statically generated at first archive build. Target: ≥ 150 entity history pages (entities with at least one briefing appearance).
- `/updates/archive` indexed by Google within 14 days of launch (confirm via Search Console "URL Inspection").
- RSS feed validated and parseable in 3 major feed readers (Feedly, NetNewsWire, NewsBlur) within 7 days of launch.
- Search function returns correct results for at least 5 entity names tested at launch (manual QA).

### Post-launch metrics (6-month horizon)

- Archive-assisted Score-Watch conversion: sessions that visit ≥ 2 archive or history pages and then purchase Score-Watch. Target: ≥ 10% of Score-Watch conversions touch archive before purchase.
- Cited in external research (academic, NGO, journalism): at least 3 externally verifiable citations of `/updates/[date]` URLs within 6 months of launch.
- Archive SEO: at least 5 entity-name + benchmark queries returning Compassion Benchmark archive pages in Google top-10 results within 6 months.

---

## 7. Out of scope (explicit non-goals)

The following are explicitly excluded from this PRD. Any proposal to add these must be scoped separately and approved:

1. **Paid archive / paywalled access.** The research archive is a public credibility surface. Monetization comes from Score-Watch, research reports, and certified assessments — not archive access fees.

2. **Internal CMS or authoring interface.** Briefings are produced by the research pipeline. The site is a read-only consumer of pipeline outputs. No CMS.

3. **Redesign of `/updates` landing page.** The current landing page is not in scope. Archive MVP adds new pages and internal links; it does not alter the structure, layout, or content of the existing `/updates` page.

4. **Account systems, saved searches, bookmarks, or personalized views.** Static export constraint. No server-side session management.

5. **Comments, ratings, community annotation.** No social layer. Not consistent with institution's analytical positioning.

6. **Server-side search (Algolia, Elasticsearch, Typesense).** Static export constraint. Client-side search on a pre-built index only.

7. **API access to archive data.** A separate P2 monetization item. Not in this scope.

8. **Backfill of internal research artifacts (MD files, change proposals, digests) as public content.** Internal pipeline outputs remain internal.

9. **Real-time or near-real-time archive updates.** The archive reflects the most recent build. Updates on new briefing publication require a build. This is the existing model and is not changed by this PRD.

10. **Historical backfill before April 15, 2026.** The archive reflects what has been published as daily briefings. No retroactive fabrication of earlier dates.

---

## 8. Open questions to resolve before architecture phase

**Q1: Entity history data extraction scope — `recentAssessments` only, or also `boundaryWatch` and `topSignals`?**

The entity history page design above requires scanning `recentAssessments` arrays across all 42 daily JSONs. However, some entities appear in `boundaryWatch` or `topSignals` without appearing in `recentAssessments` (e.g., Anthropic appears in `boundaryWatch` for cycles where it was not included in the `recentAssessments` array). If the history page is scoped to `recentAssessments` only, it may miss cycles where an entity was actively being held at a boundary. Decision needed: should entity history include `boundaryWatch` entries (more complete but more complex); or `recentAssessments` only (simpler, covers the primary scored record)?

Recommendation: include `recentAssessments` as the primary source and `boundaryWatch` as supplementary. Mark `boundaryWatch`-only entries visually distinct (e.g., "Boundary Watch — not in main assessment rotation this cycle").

**Q2: Search index size and client-side performance at scale.**

The pre-built search index will include text from all briefings. Each daily JSON is large (the May 25 file is ~44KB of structured JSON; search-relevant text per briefing is approximately 15-20KB). At 42 briefings the search index is ~630-840KB of text. At 200 briefings (6-month horizon) this grows to ~3MB. This is within acceptable range for a single client-side fetch, but the architect must confirm: (a) whether the index should include full description text from `topSignals.description` or only the first 200 characters; (b) whether a compressed/minified index format is needed; (c) whether a search library (Fuse.js, MiniSearch) is appropriate or a simple substring match suffices for current volume.

Decision needed before the search index build script is written.

**Q3: Entity history page URL convention and relationship to existing entity detail pages.**

Current entity detail pages live at a route pattern that must be confirmed (the CLAUDE.md does not specify the exact entity detail route). The history page is proposed as `/entity/[index]/[slug]/history`. If entity detail pages use a different URL pattern (e.g., `/indexes/[index]/[slug]`), the history page must nest under the same base to preserve navigation coherence and internal link graph structure. Architect must confirm the existing entity detail URL pattern before the history page route is defined.

**Q4: Feed generation as a build script vs. a generated static file in `app/`.**

The RSS and JSON feed can be generated either as static files written by `scripts/export-public-data.mjs` (consistent with the existing `public/data/` generation pattern) or as Next.js Route Handlers that output static files at build time. The existing build uses `output: 'export'` which supports Route Handlers for static file generation. Either approach is valid. The architect must decide which pattern is consistent with the build system to avoid a divergent pattern. If Route Handlers are used, the feed URL must still be `/updates/feed.xml` (not `/api/feed.xml`).

**Q5: Build time impact of iterating all 42 daily JSON files for entity history generation.**

Entity history page generation requires iterating all daily JSON files for every entity that appears in the archive. At 1,156 entities and 42 briefings, most entities appear in few or no briefings, but the build-time scan must check all combinations. At 200 briefings this is a larger scan. The architect and frontend engineer must confirm whether the build-time cost of generating ~150+ entity history pages with full-archive scans is within acceptable Next.js static export build time, or whether a pre-computed entity-history index JSON (analogous to `public/data/scores/`) is needed to avoid per-page re-scanning.

---

## 9. Handoff checklist

Before implementation begins, confirm:

- [ ] Q1 resolved: entity history data scope (`recentAssessments` only vs. `boundaryWatch` + `recentAssessments`)
- [ ] Q2 resolved: search index design (size, library, truncation strategy)
- [ ] Q3 resolved: entity detail URL pattern confirmed by frontend engineer
- [ ] Q4 resolved: feed generation method (build script vs. Route Handler)
- [ ] Q5 resolved: build time impact assessed; pre-computed index decision made
- [ ] All new static routes added to `generateStaticParams` before build
- [ ] Feed autodiscovery `<link>` tags scoped into `DailyBriefing` component or layout
- [ ] Umami events defined for new surfaces: `archive_landing_view`, `entity_history_view`, `search_query`, `search_result_click`, `feed_xml_access`

---

## 10. Assumptions flagged

The following assumptions are baked into this PRD. If any are wrong, requirements may change:

- **A1:** Entity detail pages currently exist at a route that can be extended with a `/history` child. If entity routes are flat (not nested), the URL pattern changes.
- **A2:** All 42 daily JSON files have consistent `recentAssessments` array structure with `slug`, `index`, `status`, `published`, `assessed`, `delta`, `whyHeadline` fields present. If schema varies across earlier dates, the history page build script needs field-level fallback handling.
- **A3:** The static export constraint remains in force. No server-side runtime is introduced for this feature set.
- **A4:** `manifest.json` is the authoritative list of published dates. No date page exists without a manifest entry.
- **A5:** The existing `entityChanges.ts` build-time scan pattern is the correct reference for how to iterate daily JSONs at build time. The entity history page generator will follow the same pattern but accumulate all entries per entity rather than only the most recent.
