# Architecture — Daily Research Archive

Owner: Phil Kling (solo)
Status: Recommendation, ready for build
Date: 2026-05-25
Author: System Architect agent

This document specifies the architecture for the Compassion Benchmark **daily-research archive system**: the public-facing, permanent, browsable record of every daily briefing the benchmark publishes, plus per-entity score history, search, and machine-readable feeds.

It is binding on backend, frontend, and devops work for the archive surface. It does not alter the underlying assessment system or the Score-Watch commercial plane (covered in `docs/ARCHITECTURE_MONETIZATION.md`).

---

## 0. Scope and constraints

### Inputs the architecture must respect

- **Static export only.** `site/next.config.ts` sets `output: "export"`. No server runtime, no route handlers, no ISR. Every public surface must be a file on disk after `next build`.
- **Next.js 16 with breaking changes.** Per `site/AGENTS.md`: "This is NOT the Next.js you know." App-router APIs (`params` as `Promise<>`, `generateStaticParams` semantics, `MetadataRoute.Sitemap`) must be re-verified against `node_modules/next/dist/docs/` before implementation. No assumption that any prior Next.js pattern still applies verbatim.
- **No new server.** The single non-static piece is the existing Cloudflare Worker at `api.compassionbenchmark.com`. Its scope is commercial fulfillment (Score-Watch webhooks, badge SVG, unsubscribe). Per the independence policy in `worker/src/index.ts`, the Worker MUST NOT acquire any new dependency on the archive data; archive remains static.
- **Independence policy.** Entities never pay for inclusion, score changes, or suppression of findings. The archive surface must contain no entity-paid features and no per-entity sponsorship.
- **Data already in repo.** 42 daily briefings live at `site/src/data/updates/daily/<date>.json`; the manifest at `site/src/data/updates/manifest.json` is the authoritative date list. The `site/src/data/updates/entityChanges.ts` module already builds an in-memory cross-day index at build time.

### What "archive" means in this document

The archive is the set of public surfaces that let humans, search engines, and machine consumers discover and re-read prior daily briefings and per-entity research history:

1. The latest briefing (today's research).
2. Every historical briefing, addressable by date.
3. A browsable index across all dates.
4. A per-entity history timeline for every assessed entity.
5. Machine-readable feeds (RSS + JSON Feed).
6. Full-text search over briefing content.
7. Sitemap entries for every URL above.

---

## 1. Storage layer

### Decision: **Keep all daily briefings in-repo forever.**

#### Cost projection (5 years)

| Item | Today | Year 1 | Year 5 |
|---|---|---|---|
| Daily briefings (`site/src/data/updates/daily/`) | 42 files | ~250 files | ~1,250 files |
| Avg size (gzipped on disk in git) | ~50 KB | ~50 KB | ~50 KB |
| Total briefing payload | ~2 MB | ~12 MB | ~60 MB |
| Total `research/` directory (scans, assessments, change-proposals) | ~10 MB | ~60 MB | ~300 MB |
| Git pack overhead (delta-compressed history) | minimal | ~30% above raw | ~30% above raw |
| Net repo size impact | negligible | acceptable | ~400 MB total — still well below GitHub's 1 GB soft limit and 5 GB hard limit |

At the realistic publication rate (~250 weekday briefings/year), the briefing payload itself never exceeds 100 MB even at 10 years. The `research/` internal artifacts grow faster but are already in the repo and outside the public bundle.

#### Why in-repo forever wins

| Option | Verdict | Reason |
|---|---|---|
| (a) In-repo forever | **Chosen** | Free. Version-controlled (git is the audit log; this matters for the integrity policy in `research/integrity-reports/`). Build-time imported with zero infra. Reversible. No second storage system to operate. |
| (b) Tier briefings >12 months old to S3/R2 | Rejected | Adds AWS/Cloudflare R2 dependency, IAM, CORS, lifecycle policies, and a fetch path. Saves no real money (60 MB after 5 years is irrelevant). Breaks build-time imports — would require runtime fetches, which conflicts with static export. |
| (c) Move briefings out of repo into a public CDN bucket from day one | Rejected | Same downsides as (b). Loses git as the integrity ledger. |
| (d) Database (SQLite committed; Postgres on VPS) | Rejected | A briefing is a document, not a relational record. JSON files are the right shape. SQLite-in-repo adds binary diffs that pollute commit history. Postgres adds a server we don't need. |

#### What stays out of the public bundle

`research/` contents (scans, scanner output, change-proposals, integrity reports) remain repo-local but are NOT copied into `site/public/`. They are evidence artifacts, not publication surfaces. Only `site/src/data/updates/daily/<date>.json` is public-facing — already the existing convention.

#### When to revisit

Reopen this decision if any of the following becomes true:
- Repo size approaches 1 GB (re-evaluate; consider Git LFS for `research/scans/`).
- A single briefing exceeds 500 KB (chunk by section).
- Build time exceeds 5 minutes (then tier on age, not on storage).

---

## 2. Per-entity history page architecture

### Decision: **(a) Build-time aggregation.**

#### Architecture

```
site/scripts/build-entity-history.mjs   ← NEW prebuild step
   │
   ├── reads:  site/src/data/updates/manifest.json
   ├── reads:  site/src/data/updates/daily/*.json
   ├── reads:  site/public/data/index.json (entity catalog)
   │
   └── writes: site/public/data/history/<slug>.json   ← one file per entity
       writes: site/public/data/history/_manifest.json ← catalog of slugs with history

Route: site/src/app/entity/[slug]/history/page.tsx
   ├── generateStaticParams() → reads history/_manifest.json → returns slugs with ≥1 record
   └── page component → fetches /data/history/<slug>.json client-side OR imports at build
```

#### Output shape: `site/public/data/history/<slug>.json`

```json
{
  "slug": "slovakia",
  "name": "Slovakia",
  "indexSlug": "countries",
  "kind": "country",
  "currentComposite": 31.6,
  "currentBand": "Developing",
  "events": [
    {
      "date": "2026-05-25",
      "type": "score-change",
      "publishedScore": 33.6,
      "assessedScore": 31.6,
      "delta": -2.0,
      "publishedBand": "Developing",
      "assessedBand": "Developing",
      "bandChange": false,
      "confidence": 0.92,
      "headline": "European Parliament 418-207 votes to urge EU Conditionality Mechanism",
      "recommendation": "apply",
      "briefingUrl": "/updates/2026-05-25"
    },
    {
      "date": "2026-05-22",
      "type": "score-change",
      "publishedScore": 39.1,
      "assessedScore": 33.6,
      "delta": -5.5,
      ...
    },
    {
      "date": "2026-05-20",
      "type": "sub-threshold",
      "direction": "downward",
      "magnitude": 0.5,
      "note": "...",
      "briefingUrl": "/updates/2026-05-20"
    }
  ],
  "firstSeen": "2026-04-15",
  "lastUpdated": "2026-05-25"
}
```

#### Why build-time aggregation wins

| Option | Verdict | Reason |
|---|---|---|
| (a) Build-time aggregation per entity | **Chosen** | Pure static. Cacheable forever (filename includes content hash via `?v=<buildSha>` if needed). Each page loads one small JSON file. No runtime cost. Mirrors the existing `export-public-data.mjs` pattern. |
| (b) Client-side aggregation from raw daily JSONs | Rejected | Forces the browser to download every daily briefing (~60 MB at 5 years) on every entity-history page load. Unworkable. |
| (c) Worker endpoint with KV/D1 | Rejected | Violates the independence-policy-driven Worker scope: Worker is commercial plane only. Adds runtime cost and a second source of truth. The git-tracked JSONs ARE the audit ledger; querying them via KV creates drift risk. |

#### Sizing

- ~1,160 entities × avg 5–10 KB per file (empty for entities with no history; richer for active ones) = **~10–15 MB total** on disk in `site/public/data/history/`.
- For entities with NO events: emit a minimal stub `{ slug, name, currentComposite, currentBand, events: [] }` so the page always exists and the timeline gracefully shows "no events recorded yet."
- File-level cache headers: long-lived (`Cache-Control: public, max-age=86400, immutable`) — when content changes the next nightly build rewrites the file and busts caches via build-manifest hash.

#### Static generation strategy

`generateStaticParams()` returns ONLY slugs with at least one history event in v1 (caps SSG output growth — see §7). The page itself is reachable for any slug via a fallback approach is NOT possible under static export; for slugs without events, either:
- (preferred v1) Include them all in `generateStaticParams()` with empty event arrays — pure static, predictable count, simple.
- (deferred v2) Conditionally include only entities with events, and have entity detail pages link to `/history` only when events exist.

**v1 chooses option preferred above**: all ~1,160 entities get a history page. See §7 for the build-time impact analysis.

---

## 3. Search architecture

### Decision: **Pagefind (option a).**

#### Why Pagefind

| Option | Verdict | Reason |
|---|---|---|
| (a) Pagefind | **Chosen** | Purpose-built for static sites. Generates a sharded, chunk-loaded index at build time from the already-exported HTML. Zero runtime. Zero JS framework lock-in. Lazy-loads index shards (~50 KB initial), keeping page weight low. Ships its own UI component but allows custom UI bound to the JS API. Handles ~10k pages with sub-100ms client query latency. Independence-safe (no third party sees queries). |
| (b) FlexSearch with prebuilt JSON index | Rejected | Forces a single index JSON download (likely 2–5 MB at our scale). Slower first-query latency. We would re-implement what Pagefind already does. |
| (c) Server-side via Worker | Rejected | Violates Worker scope (commercial plane only). Cost-positive. Independence-policy risk: who sees query logs? Adds operational surface. |
| (d) External (Algolia, Typesense Cloud) | Rejected | Recurring cost; vendor lock-in; independence-policy risk (third party sees query patterns, can be subpoenaed, can be pressured); breaks the "no entity-paid features" guarantee if free tier disappears. |

#### Integration shape

```
postbuild step (new):
  site/scripts/build-search-index.mjs
    └── runs: npx pagefind --site out/ --output-subdir _pagefind
              (treats out/ as the built static site after `next build`)

Output:
  site/out/_pagefind/
    ├── pagefind.js           (loader — ~30 KB)
    ├── pagefind-ui.js        (optional default UI — we use custom)
    └── index/*.pf_index      (sharded index files, lazy-loaded on query)

Frontend:
  site/src/app/updates/search/page.tsx
    └── Client component imports /pagefind/pagefind.js dynamically;
        runs queries against indexed daily-briefing pages + entity-history pages.
```

#### What Pagefind indexes

- All `/updates/<date>` pages (briefing content: headlines, summaries, top signals, methodology rulings).
- All `/entity/<slug>/history` pages (entity name, score deltas, headlines).
- Excluded: index list pages, service pages, legal pages (via `data-pagefind-ignore` on those routes' root containers).

#### Search URL convention

`/updates/search?q=<term>` — fully client-rendered results page. Query lives in URL for shareability and back-button support. No server roundtrip.

---

## 4. Feed formats

### Decision: **RSS 2.0 + JSON Feed 1.1 at build time. Atom deferred.**

#### Routes

- `/updates/feed.xml` — RSS 2.0
- `/updates/feed.json` — JSON Feed 1.1
- `/updates/feed.atom` — **deferred**; emit only if a known consumer requests it.

#### Generation

Add a new prebuild script `site/scripts/build-feeds.mjs` that:

1. Reads `site/src/data/updates/manifest.json` for the date list.
2. Reads the latest N briefings (recommend N=30 for feed payload size).
3. For each briefing, builds an item with:
   - `title` = briefing headline.
   - `link` = `https://compassionbenchmark.com/updates/<date>`.
   - `guid` / `id` = canonical URL (stable, never reused).
   - `pubDate` = briefing's `generatedAt` field.
   - `description` / `content_html` = briefing summary (NOT full top-signal payload — keep feeds light; readers click through).
   - `categories` / `tags` = list of impacted index slugs (countries, ai-labs, etc.).
4. Writes `site/public/updates/feed.xml` and `site/public/updates/feed.json`.

Both feeds are static files served directly by nginx. The build-manifest hash invalidates CDN caches.

#### Feed item count policy

- Last 30 briefings in the feed (≈6 weeks of weekday publishing).
- Full archive remains addressable via `/updates/archive` (see §5).
- Per RSS convention, oldest items drop off the feed when new ones arrive. Archive page is the durable record.

#### Discovery

Add `<link rel="alternate" type="application/rss+xml" href="/updates/feed.xml" title="...">` and the JSON Feed equivalent to the site root `<head>` (in `layout.tsx`) so feed readers auto-detect.

---

## 5. URL and route structure

### Decision: canonical paths below.

| Path | Status | Static generation | Notes |
|---|---|---|---|
| `/updates` | Exists | Static page → latest briefing | Imports `latest.json`; navbar entry. |
| `/updates/[date]` | Exists | `generateStaticParams()` over manifest dates | One static HTML per date. |
| `/updates/archive` | **NEW** | Static page | Reverse-chronological index of every date in manifest. Paginated client-side (or single long page if <500 entries). |
| `/updates/search` | **NEW** | Static shell + client-rendered results | Pagefind-powered. Query in `?q=`. |
| `/updates/feed.xml` | **NEW** | Static file in `public/` | RSS 2.0. |
| `/updates/feed.json` | **NEW** | Static file in `public/` | JSON Feed 1.1. |
| `/entity/[slug]/history` | **NEW** | `generateStaticParams()` over entity catalog | One static HTML per entity slug; loads `/data/history/<slug>.json`. |

#### Why a new `/entity/...` route prefix (not extending existing `/company/`, `/country/`, etc.)

Two options were considered:

| Option | Verdict | Reason |
|---|---|---|
| (i) Add `/history` sub-route under each kind: `/country/<slug>/history`, `/company/<slug>/history`, etc. (7 new dynamic routes) | Rejected | 7-fold duplication of generation logic. Requires kind-aware history data shape. Future-hostile if new entity kinds are added. |
| (ii) Single unified `/entity/[slug]/history` route resolved via the unified slug catalog (`site/public/data/index.json`) | **Chosen** | One generation path. Mirrors how `export-public-data.mjs` already treats slugs as a unified namespace. Slug uniqueness across indexes is already enforced (with collision warnings) in that script. |

**Collision risk:** The slug catalog has cross-index collision warnings (see `export-public-data.mjs` line 136–144). If two entities in different indexes share a slug, the history page must disambiguate. v1 policy: emit history for the collision-winning slug (last-written, matching badge behavior). Surface a collision lint failure in the build if any active history-having entity collides. Long-term: namespace by kind, but defer until a collision actually impacts a published entity.

#### Backlinks

- Each `/updates/<date>` page links to `/updates/archive` and to `/updates` (latest).
- Each `/entity/<slug>/history` page links back to the entity detail page (`/<kind>/<slug>`).
- Each entity detail page (`/<kind>/<slug>`) shows a "View full history" link to `/entity/<slug>/history` when events exist.
- The `/updates/archive` page links to `/updates/feed.xml` and `/updates/feed.json` for discovery.

---

## 6. Sitemap and SEO

### Decision: extend `site/src/app/sitemap.ts` to enumerate every new URL.

#### Implementation

The existing sitemap (`site/src/app/sitemap.ts`) returns a `MetadataRoute.Sitemap` from a single static function. Extend it to:

1. **Add every date in `manifest.json` as `/updates/<date>`** with `changeFrequency: "never"` (a published briefing does not change) and `lastModified` = briefing's `generatedAt`. Priority 0.7.
2. **Add `/updates/archive`** with `changeFrequency: "daily"` and current timestamp. Priority 0.8.
3. **Add every entity-history URL `/entity/<slug>/history`** with `changeFrequency: "weekly"` and `lastModified` = entity's history `lastUpdated`. Priority 0.5.
4. **Do NOT add `/updates/search`** (search results pages should not be indexed — add `<meta name="robots" content="noindex">` to the page).
5. **Do NOT add feed URLs** to sitemap (feeds are discovered via `<link rel="alternate">`, not by crawlers needing entries).

#### Sitemap size

At 5 years (~1,250 dates + ~1,160 history pages + existing ~1,200 entity pages + ~30 index/service/info pages), total sitemap entries ≈ **3,650**. Well under the 50,000-entry per-sitemap limit. Single file is fine; no sitemap index needed until ≥40k entries.

#### `robots.txt`

Confirm `site/public/robots.txt` references the sitemap. If absent, add:

```
User-agent: *
Allow: /
Sitemap: https://compassionbenchmark.com/sitemap.xml
```

#### Per-briefing structured data

Each `/updates/<date>` page already emits `NewsArticle` JSON-LD (visible in the existing `updates/[date]/page.tsx`). Audit that:
- `datePublished` and `dateModified` are accurate.
- `mainEntityOfPage` matches the canonical URL.
- `headline` is ≤110 chars (Google's NewsArticle limit) — current data has long headlines; truncate at render time for the JSON-LD field only.

#### Per-history-page structured data

New `/entity/<slug>/history` pages should emit `Dataset` JSON-LD describing the timeline (publisher, identifier, license, distribution as the JSON file). This signals research-content classification to crawlers.

---

## 7. Build-time impact

### Quantified impact

| Asset | Today | After archive launch |
|---|---|---|
| Entity detail pages | ~1,200 | ~1,200 (unchanged) |
| Daily briefing pages | 42 | 42 → ~250 (year 1) → ~1,250 (year 5) |
| Entity history pages | 0 | ~1,160 |
| Archive index page | 0 | 1 |
| Search shell page | 0 | 1 |
| Feeds (static files) | 0 | 2 |
| **Total static HTML files** | **~1,250** | **~2,450 (year 1) → ~3,650 (year 5)** |
| Sitemap entries | ~1,250 | ~2,450 → ~3,650 |
| `site/public/data/` JSON files | ~1,200 score files + 1 catalog | + ~1,160 history files + 1 history manifest + feeds |

**Conclusion: archive launch roughly doubles SSG output once entity-history is included.**

### Build-time cost estimate

- Current `npm run build` time: assume baseline B.
- Doubling page count does NOT double build time linearly under Next.js 16's compile-once-render-many static export (most cost is webpack compile + framework bundle; per-page render is fast for these data shapes).
- Realistic estimate: build time increases **30–60%**, not 100%.

### Mitigation strategy (if needed)

Apply only if build time exceeds 5 minutes after launch:

1. **Skip empty-history pages.** Only generate `/entity/<slug>/history` for slugs with ≥1 event in the history aggregation step. Saves ~80% of history-page SSG (most entities have no events). Trade-off: 404 on direct URL access for empty entities; entity detail page must conditionally render the "View history" link.
2. **Increment-only history aggregation.** `build-entity-history.mjs` reads a cached prior output and only re-emits files for slugs touched by the new briefing date. Saves I/O cost on the aggregation step itself.
3. **Cap briefing prerender at N=365 (last year).** Older briefings remain as committed JSON; build a single static "Archive: pre-<cutoff>" page that lazy-fetches the JSON client-side. Defer this until total date count exceeds 500.

**v1 launch does none of these.** Ship the simple version. Measure. Optimize only if numbers demand it.

### Build observability

Extend `build-manifest.json` (already generated by `site/scripts/build-manifest.mjs`) to include:

```json
{
  ...existing fields...,
  "archive": {
    "briefingCount": 42,
    "entityHistoryCount": 1160,
    "entitiesWithEvents": 87,
    "feedItemsEmitted": 30,
    "searchIndexShards": 12,
    "buildDurationMs": 184321
  }
}
```

This makes regression visible — if `buildDurationMs` doubles unexpectedly, we know within one deploy.

---

## 8. Implementation sequence

Five discrete PRs. Each is independently deployable. Each leaves the site in a working state.

### PR 1 — Sitemap and route shells (low risk, unblocks SEO)

**Scope:**
- Extend `site/src/app/sitemap.ts` to include every `/updates/<date>` URL from manifest.
- Add `/updates/archive` route — a static page listing every date in manifest, reverse-chronological, grouped by month.
- No data-shape changes. No new prebuild steps.

**Acceptance:**
- `sitemap.xml` contains all 42 (and future) date URLs.
- `/updates/archive` renders and links to every date page.
- Existing functionality unchanged.

**Risk:** very low.

---

### PR 2 — Per-entity history aggregation and routes

**Scope:**
- New prebuild script: `site/scripts/build-entity-history.mjs`. Reads daily briefings, writes `site/public/data/history/<slug>.json` and `_manifest.json`.
- New route: `site/src/app/entity/[slug]/history/page.tsx`. `generateStaticParams()` reads `_manifest.json`.
- Update entity detail pages: conditionally show "View full history" link when events exist.
- Extend sitemap to include history URLs.
- Extend `build-manifest.json` with archive counters.

**Acceptance:**
- Every entity with at least one score change in the briefing record has a history page.
- Build time delta ≤ 60%.
- Entity detail pages link out correctly; no broken links.

**Risk:** medium (largest single addition; touches build pipeline and adds new SSG fanout).

**Open question to resolve before this PR:** decide whether empty-history entities get a page (v1 says yes; if build time spikes, fall back to "events only" — see §7 mitigation 1).

---

### PR 3 — RSS and JSON Feed

**Scope:**
- New prebuild script: `site/scripts/build-feeds.mjs`. Reads last 30 briefings; writes `site/public/updates/feed.xml` and `feed.json`.
- Add `<link rel="alternate">` tags to the root layout for discoverability.
- Add validation: feeds must parse as valid RSS 2.0 and JSON Feed 1.1 (CI-friendly assertion).

**Acceptance:**
- `https://compassionbenchmark.com/updates/feed.xml` validates at https://validator.w3.org/feed/.
- `https://compassionbenchmark.com/updates/feed.json` validates against jsonfeed.org/version/1.1.
- Subscribed test reader (e.g. Feedly) receives new items.

**Risk:** low.

---

### PR 4 — Pagefind search

**Scope:**
- Add `pagefind` as a dev dependency.
- New postbuild step (added to `package.json` build script after `next build`): run `pagefind --site out/`.
- New route: `site/src/app/updates/search/page.tsx`. Client component loading `/pagefind/pagefind.js` dynamically. URL-bound query (`?q=`).
- Add search link to navbar and to `/updates/archive`.
- `noindex` meta on search page.

**Acceptance:**
- Search query returns results from all `/updates/<date>` and `/entity/<slug>/history` pages.
- First-keystroke latency < 200ms on a typical broadband connection.
- Build artifact size increase ≤ 5 MB.

**Risk:** medium (introduces a new toolchain dependency; verify it works under static export and the nginx serving setup).

---

### PR 5 — Polish, telemetry, and docs

**Scope:**
- Validate JSON-LD on `/updates/<date>` pages (truncate headlines >110 chars for Google News).
- Add `Dataset` JSON-LD to `/entity/<slug>/history` pages.
- Add `robots.txt` entry if missing.
- Update `DEPLOYMENT.md` with archive-specific build steps.
- Update `CLAUDE.md` folder structure section with new `site/public/data/history/` and `site/public/updates/feed.*` paths.
- Run integrity-check (`research/scripts/integrity-check.mjs`) confirming no entity-paid features were introduced.

**Acceptance:**
- Independence audit passes.
- All routes documented.
- Build manifest reflects all new counters.

**Risk:** very low.

---

### Optional PR 6 — Atom feed and feed enhancements (deferred)

Emit `/updates/feed.atom` if a consumer requests it. Add per-impacted-index feed variants (`/updates/feed-countries.xml`, etc.) if usage data justifies it. **Defer until evidence demands it.**

---

## 9. Open risks and ambiguities

These should be confirmed before PR 2 lands:

1. **Slug namespace collisions across indexes.** Resolved policy: last-write-wins for v1, with build-time lint failure on any collision that has events. Long-term: namespace by kind. Confirm acceptable.
2. **Empty-history pages.** v1 generates all. If build time becomes a problem, switch to "events only." Decision deferred to measured data.
3. **Feed item count.** Default 30. Confirm with the parent (could be 50 or even "all briefings" — the latter has SEO concerns since feeds aren't meant to be archives).
4. **Search index excludes.** The site has commercial pages (`/purchase-research`, `/advisory`, etc.). Confirm these are NOT in the Pagefind index — archive search should only return research surfaces.
5. **Next.js 16 specifics.** Before implementing PR 2, the implementing agent MUST read `node_modules/next/dist/docs/` for the current `generateStaticParams` and `MetadataRoute.Sitemap` semantics. Do not assume prior-Next.js behavior.
6. **`/updates/[date]` already exists; verify `notFound()` behavior under static export.** In static export, a `notFound()` call requires a `not-found.tsx` page to be generated, not a runtime 404. Audit on first archive build.

---

## 10. Non-goals (explicit)

The following are **out of scope** for the archive system, even though they could plausibly be added:

- Comment threads on briefings. (Out of scope; no public comment surface.)
- Per-briefing share counters or social proof. (Out of scope; independence policy.)
- User accounts. (Out of scope; the only user state is Score-Watch subscriptions, handled by the existing Worker.)
- Newsletter signup gated on briefing content. (Out of scope; existing newsletter signup is on `/updates` and that is sufficient.)
- Versioned briefings ("v2 of 2026-05-25"). Briefings are immutable once published. Corrections become new briefings.
- API access to archive data. (Out of scope; the JSON files in `site/public/data/` are already HTTP-fetchable and that IS the API.)

---

## 11. Handoff

- **Backend / build pipeline:** PRs 2, 3, 4 (new prebuild scripts).
- **Frontend:** PRs 1, 2, 4 (new routes and components).
- **Devops:** PR 4 (verify Pagefind output is served by nginx; verify CDN caching headers on `_pagefind/*` assets).
- **Analytics:** post-launch, instrument `/updates/archive` and search-query patterns (privacy-respecting; aggregate only).

All downstream agents should read this document before implementing. Architecture-level questions return here; implementation questions go to the relevant subagent.
