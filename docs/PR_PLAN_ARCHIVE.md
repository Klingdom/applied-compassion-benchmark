# Daily Research Archive — PR Plan (for review & approval)

Owner: Phil Kling
Status: **Ready for review** — implementation not started
Date: 2026-05-25
Author: Coordinator (AI CTO) — synthesized from 4 specialist agents

This document is the approval artifact. Once you sign off on the PRs below, individual implementation tickets get dispatched to backend/frontend engineers in sequence.

---

## Why this matters (90 seconds)

42 daily briefings exist on disk and are statically prerendered at `/updates/<date>` — but **discoverability is broken**:

- Only the last 5 dates appear in the dropdown nav
- No way to browse the full archive
- No way to view all score events for a single entity (the highest-value research workflow)
- No search across briefings
- No RSS/JSON feed for journalists & researchers
- Sitemap doesn't index historical briefings (SEO compounding ≈ zero)

The archive is the **strategic asset** that turns the daily research into an evidence-linked institutional record. Building it is mostly wiring up data that already exists.

---

## Source artifacts (subagent outputs feeding this plan)

| Document | Author | Decision |
|---|---|---|
| `docs/PRD_ARCHIVE.md` | product-manager | MVP scope: archive landing + entity history + search + RSS/JSON feed |
| `docs/ARCHITECTURE_ARCHIVE.md` | system-architect | In-repo forever, build-time aggregation, **Pagefind** for search |
| `docs/UX_FLOWS_ARCHIVE.md` | ux-designer | Sticky month groups, hover-expand previews, search-index over metadata only |
| `docs/METRICS_ARCHIVE.md` | analytics | Day-1 instrumentation: `archive_search_query`, archive entry funnel, `entity_history_loaded` |

Read those four docs for the full reasoning. This document captures the **execution sequence**.

---

## Architectural North Star

```
                        ┌───────────────────────────┐
                        │ research/ (internal)       │
                        │  scans/  assessments/      │
                        │  digests/  change-proposals│
                        └────────────┬──────────────┘
                                     │ (overnight pipeline, untouched)
                                     ▼
                        ┌───────────────────────────┐
                        │ site/src/data/updates/      │
                        │  manifest.json              │
                        │  daily/<date>.json          │
                        │  latest.json                │
                        └────────────┬──────────────┘
                                     │ (build time)
                                     ▼
              ┌─────────────────────────────────────────────────┐
              │  /updates                  (latest briefing)     │
              │  /updates/<date>           (historical briefing) │
              │  /updates/archive          ⬅ NEW — landing       │
              │  /updates/feed.xml         ⬅ NEW — RSS           │
              │  /updates/feed.json        ⬅ NEW — JSON Feed     │
              │  /entity/<slug>/history    ⬅ NEW — timeline      │
              │  /sitemap.xml              ⬅ EXTEND              │
              │  /_pagefind/*              ⬅ NEW — search index  │
              └─────────────────────────────────────────────────┘
```

**One new prebuild script:** `site/scripts/build-entity-history.mjs` aggregates daily briefings into `site/public/data/history/<slug>.json`.

**No server changes.** No Worker changes. No new dependencies in production runtime — Pagefind generates static artifacts at build time only.

---

## PR Plan — 5 PRs for MVP + 1 deferred

PRs are designed to be **independently deployable** and reviewable in <30 min each. Each PR has explicit acceptance criteria and rollback plan.

---

### PR 1 — Archive landing page + sitemap extension
**Branch:** `feat/archive-landing`
**Risk:** 🟢 Low (additive only)
**Estimated effort:** ~3-4 hours
**Depends on:** none

#### Scope
1. New route: `site/src/app/updates/archive/page.tsx`
   - Server component, statically generated
   - Imports `manifest.json` + iterates daily JSONs
   - Lists all briefings, newest first, grouped by month
   - Each row: date label · headline · entities-assessed count · score-changes count · top-3 entities chips
2. New component: `site/src/components/updates/ArchiveList.tsx`
   - Sticky month headers
   - Hover-to-expand preview (inline row expansion per UX doc)
   - Filter dropdowns: Month, Sector, Entity (client-side filtering on already-loaded data)
   - Sort selector: Chronological (default) | Most significant (by score-changes count)
3. Add `/updates/archive` to `site/src/data/nav.ts`
4. Extend `site/src/app/sitemap.ts` (or create) to include every `/updates/<date>` URL
5. Add cross-link from existing `/updates` page to `/updates/archive`
6. Add cross-link from existing `/updates/<date>` archive banner to `/updates/archive`

#### Acceptance criteria
- [ ] `/updates/archive` builds successfully (`next build` exits 0)
- [ ] Page renders all 42 (current) dates grouped by month
- [ ] Filter by sector reduces list correctly
- [ ] Filter reset clears all chips
- [ ] `sitemap.xml` includes 42 `/updates/<date>` entries + `/updates/archive`
- [ ] Mobile viewport (375px): no horizontal scroll, sticky headers work
- [ ] Lighthouse SEO score ≥ 95 on `/updates/archive`
- [ ] No new lint errors; `npm test` still 80/80

#### Rollback
Revert single PR. `/updates` and `/updates/<date>` unaffected because they're untouched.

---

### PR 2 — Per-entity history pages
**Branch:** `feat/entity-history`
**Risk:** 🟡 Medium (largest PR; doubles SSG output)
**Estimated effort:** ~6-8 hours
**Depends on:** PR 1 (uses the same manifest helper)

#### Open question to resolve before starting
> Architect's flag: should history pages include `boundaryWatch` entries (entity held but mentioned) or only `recentAssessments` (entity actually assessed)? Recommendation: **both**, with visual distinction. Anthropic has 7 `boundaryWatch` cycles that wouldn't otherwise surface.

#### Scope
1. New prebuild script: `site/scripts/build-entity-history.mjs`
   - Reads all `site/src/data/updates/daily/<date>.json`
   - For each entity that appears in any briefing, produces `site/public/data/history/<slug>.json` with timeline events
   - Produces `site/public/data/history/_manifest.json` listing all slugs that have history
   - Wired into `npm run prebuild` (runs before `next build`)
2. New route: `site/src/app/entity/[slug]/history/page.tsx`
   - `generateStaticParams()` reads `_manifest.json`
   - Hero: entity name, current composite, current band, total events count, sparkline of composite over time
   - Timeline: newest-first events, each showing date · delta · new composite · methodology ruling · link to source briefing
   - Independence-policy-safe Score-Watch CTA in sidebar
   - Empty state for entities with no events (architect's recommendation: still generate page; mitigates 404 risk)
3. New component: `site/src/components/entity/HistoryTimeline.tsx`
4. New component: `site/src/components/entity/CompositeSparkline.tsx` (pure SVG, <100 lines, no dependency)
5. Cross-link: from each existing entity page (Fortune-500, country, AI-lab, etc.) to its history page
6. Extend sitemap to include all `/entity/<slug>/history` URLs

#### Acceptance criteria
- [ ] Prebuild generates ≥40 entity history files (every entity referenced in current 42 briefings)
- [ ] `/entity/slovakia/history` shows ≥2 events (May 22 -5.5, May 25 -2.0)
- [ ] `/entity/turkey/history` shows ≥3 events
- [ ] `/entity/<entity-with-no-history>/history` shows empty state cleanly
- [ ] Sparkline renders without external library
- [ ] Build time delta: <30s addition to current build
- [ ] Sitemap includes every history URL
- [ ] `npm test` still 80/80
- [ ] Lighthouse score ≥ 95 on a sample history page

#### Rollback
Revert PR; remove the prebuild line from `package.json`; existing routes unaffected.

---

### PR 3 — RSS + JSON Feed
**Branch:** `feat/archive-feeds`
**Risk:** 🟢 Low (read-only generation)
**Estimated effort:** ~2-3 hours
**Depends on:** PR 1 (uses same manifest iteration)

#### Scope
1. New route: `site/src/app/updates/feed.xml/route.ts` — RSS 2.0
   - Static generation; lists all daily briefings as items
   - Per-item: title, link, pubDate, description (briefing summary), guid (canonical URL), categories (top sectors)
2. New route: `site/src/app/updates/feed.json/route.ts` — JSON Feed 1.1
   - Same coverage as RSS; richer item structure (extensions: `scoreChanges` count, `topEntities`)
3. Add `<link rel="alternate" type="application/rss+xml">` to `/updates` and `/updates/<date>` head metadata (RSS auto-discovery)
4. Add feed links to footer
5. Validate feeds against W3C Feed Validator (manual; document in commit message)

#### Acceptance criteria
- [ ] `curl https://compassionbenchmark.com/updates/feed.xml` returns valid RSS 2.0 XML
- [ ] `curl https://compassionbenchmark.com/updates/feed.json` returns valid JSON Feed 1.1
- [ ] Each feed contains ≥ all dates in manifest
- [ ] Feed icons visible in browser address bar on `/updates` (where supported)
- [ ] W3C Feed Validator returns 0 errors
- [ ] No regression in build time

#### Rollback
Revert PR; remove `<link rel="alternate">`; existing pages unaffected.

---

### PR 4 — Pagefind search integration
**Branch:** `feat/archive-search`
**Risk:** 🟡 Medium (new toolchain; affects build pipeline)
**Estimated effort:** ~5-6 hours
**Depends on:** PR 1 (search lives on `/updates/archive`)

#### Open question to resolve before starting
> Architect's flag: search corpus scope. Recommendation: index `headline`, `summary`, `scoreChanges[].whyHeadline`, entity slugs, methodology-novel rulings. Exclude raw scan data. Exclude `research/` artifacts. Cap individual document size at 5KB.

#### Scope
1. Add `pagefind` as devDependency (only)
2. New postbuild script: `site/scripts/build-search-index.mjs`
   - Runs `pagefind` against `site/out/` after `next build` completes
   - Outputs `site/out/_pagefind/` (shipped as static assets)
   - Wired into `npm run build`
3. New component: `site/src/components/search/ArchiveSearch.tsx`
   - Embedded on `/updates/archive` (collapses search box to results panel below)
   - Loads Pagefind UI lazily (only when search box focused)
   - Keyboard nav (↑↓ Enter)
   - Result groupings: by date, by entity, by methodology ruling
4. Add data-pagefind-body / data-pagefind-meta attributes to briefing pages so Pagefind indexes them correctly
5. Exclude routes that shouldn't be searchable (nav pages, sitemap source)

#### Acceptance criteria
- [ ] Searching "Slovakia" returns ≥3 results (May 22, May 25, prior assessments)
- [ ] Searching "EU conditionality" returns Slovakia + Hungary briefings
- [ ] Searching "Anthropic" returns expected briefings
- [ ] Searching a non-existent term shows empty state with suggestion
- [ ] Search index total size <2MB (sharded chunks; not loaded all at once)
- [ ] First-paint impact of `/updates/archive` <50ms (Pagefind lazy-loaded)
- [ ] Independence-policy clean: no third party sees search queries (Pagefind is purely client-side)

#### Rollback
Revert PR; remove postbuild line; search UI gracefully degrades to client-side filter that already exists from PR 1.

---

### PR 5 — Analytics instrumentation + SEO polish
**Branch:** `feat/archive-analytics`
**Risk:** 🟢 Low (event tracking + metadata only)
**Estimated effort:** ~2-3 hours
**Depends on:** PR 1, PR 2, PR 4

#### Scope
1. Wire Umami custom events per `docs/METRICS_ARCHIVE.md`:
   - `archive_filter_applied` (sector, month, entity)
   - `archive_search_query` (query length, results count)
   - `archive_result_click` (result type, result date)
   - `entity_history_loaded` (slug, event count, arrival_path)
   - `briefing_navigated_from_archive` (from_date, to_date)
2. Add JSON-LD structured data:
   - `Dataset` schema on `/updates/archive` (Google Dataset Search)
   - `Article` schema enhancement on `/updates/<date>` (add `author.url`, `publisher`)
   - `Person`/`Organization` linking for entity history pages
3. Add `robots.txt` entry permitting archive (default behavior, but explicit)
4. Lighthouse audit pass: verify all archive pages ≥95 on SEO + Accessibility
5. Update `docs/METRICS_ARCHIVE.md` with the actual event names that shipped

#### Acceptance criteria
- [ ] All 5 events fire correctly in Umami dashboard (test via local dev)
- [ ] Google Rich Results test passes on `/updates/archive`
- [ ] Lighthouse SEO ≥ 95 on `/updates/archive`, sample `/updates/<date>`, sample `/entity/<slug>/history`
- [ ] No PII in any event payload
- [ ] Privacy doc updated if needed

#### Rollback
Revert PR; tracking gracefully degrades (events stop firing; no UI impact).

---

### PR 6 (DEFERRED — post-MVP) — Atom feed + per-index feed variants
**Branch:** `feat/archive-feeds-variants`
**Risk:** 🟢 Low
**Estimated effort:** ~2 hours

Deferred. Build only if a real subscriber requests Atom format or per-index feed (e.g. RSS for "AI labs only", "Countries only"). Tracked in backlog.

---

## Total estimated effort

| PR | Effort | Cumulative |
|---|---|---|
| PR 1 — Archive landing | 3-4h | 4h |
| PR 2 — Entity history | 6-8h | 12h |
| PR 3 — RSS + JSON Feed | 2-3h | 15h |
| PR 4 — Pagefind search | 5-6h | 21h |
| PR 5 — Analytics + SEO | 2-3h | 24h |
| **MVP TOTAL** | | **~20-24 hours** |

At ~4 hours of work per evening, MVP ships in **5-6 sessions**. Each PR is shippable independently — you can pause after any one and still have a real improvement live.

---

## Sequencing logic

1. **PR 1 first** — establishes manifest helper, navigation entry point, sitemap discipline. Cheapest validation that the design works.
2. **PR 2 second** — biggest single PR but unblocks the most user value (per-entity history is the #1 research use case).
3. **PR 3 third** — fast, low risk, opens machine-readable distribution channel.
4. **PR 4 fourth** — search depends on archive existing. Defer until after PR 1-3 prove the foundation.
5. **PR 5 last** — instrument what shipped, not what's hypothetical.

---

## Day-30 success criteria (post-MVP launch)

From `docs/METRICS_ARCHIVE.md`:

- ≥15% of `/updates` sessions reach `/updates/archive`
- ≥5 organic landings/day on historical `/updates/<date>` pages (vs ~0 today)
- ≥1 entity history page reached per session that visits archive
- ≥35 archive sessions/week (minimum stable measurement unit)
- ≥25% search result CTR on `/updates/archive`
- ≥1 feed item polled per week by ≥3 distinct User-Agents (proxy for RSS readers)
- 0 Lighthouse SEO regressions on existing pages

If these targets aren't met by Day 30 → meta-coordinator runs a diagnostic loop on archive discoverability before any new work ships.

---

## What I need from you to proceed

Reply with one of:

1. **"Approve all 5 PRs — start PR 1"** → I dispatch frontend-engineer to PR 1 immediately
2. **"Approve PRs X, Y, Z — defer A, B"** → I dispatch only the approved set
3. **"Change scope: ____"** → I revise the plan with your input and re-circulate
4. **"Read the source PRDs first"** → no action; you review the 4 specialist docs then come back

The 4 source documents are at:
- `docs/PRD_ARCHIVE.md`
- `docs/ARCHITECTURE_ARCHIVE.md`
- `docs/UX_FLOWS_ARCHIVE.md`
- `docs/METRICS_ARCHIVE.md`

No code has been written. No commits made for this plan. Nothing on disk has changed yet other than these 5 planning documents.
