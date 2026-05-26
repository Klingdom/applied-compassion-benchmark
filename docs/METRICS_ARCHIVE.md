# METRICS_ARCHIVE.md — Daily Research Archive System

**Version:** 1.0
**Date:** 2026-05-25
**Owner:** Analytics
**Status:** Pre-launch spec — archive system not yet built
**Upstream artifacts:** PRD_MONETIZATION.md, ARCHITECTURE_MONETIZATION.md, site/src/app/updates/

---

## Context and measurement posture

The archive system extends the existing `/updates/[date]` briefings with: an archive landing page (`/updates/archive`), per-entity history pages (`/entity/<slug>/history`), full-text archive search, and RSS/JSON feeds. All 42 historical briefings (2026-04-15 to present) exist as static JSON and are already served at `/updates/[date]`.

The measurement objective is institutional, not commercial: demonstrate that the archive creates durable research value, compounds SEO authority, and gives the institution evidence it is building a citation-worthy record. Score-Watch has its own funnel and is excluded from this spec.

Traffic baseline is low at launch. All targets in this spec are set conservatively and should be re-evaluated at day-60 once organic data exists.

---

## 1. Metric Hierarchy

### North Star Metric

**Archive organic reach**: the number of distinct sessions per week arriving on a historical briefing page (`/updates/<date>` where date is not the current date) via organic search or external referral. This compounds unboundedly with each new briefing added, is attributable to the archive specifically, and proves the research record has external discovery value beyond the site's existing readership.

### Primary KPIs (7 metrics)

| # | Metric | Why it matters | Source |
|---|---|---|---|
| 1 | **Archive organic reach** (weekly sessions on historical `/updates/<date>` via search/referral) | North star. Proves SEO compounding. Separates archive pages from latest page in organic value. | Umami: page filter `/updates/2*` + referrer not compassionbenchmark.com |
| 2 | **Archive entry rate** (% of `/updates` sessions that navigate to `/updates/archive` or a historical briefing within same session) | Proves the archive feature is discoverable and used by current audience, not just search arrivals. | Umami: funnel — /updates pageview → /updates/archive or /updates/[non-latest-date] pageview |
| 3 | **Entity history page adoption** (pageviews on `/entity/<slug>/history`) | Measures whether per-entity longitudinal view is valued. A proxy for analyst/researcher use. | Umami: pageviews on `/entity/*/history` |
| 4 | **Archive search engagement rate** (sessions on `/updates/archive` that fire `archive_search_query` event) | Measures whether visitors find search useful, not just present. Distinguish browse vs. search behavior. | Umami: custom event `archive_search_query` / sessions on `/updates/archive` |
| 5 | **Search result click-through rate** (fraction of `archive_search_query` events followed by `archive_result_click` within the same session) | Measures result quality. A low CTR (< 30%) signals poor relevance, not low intent. | Umami: `archive_result_click` / `archive_search_query` — joined on session |
| 6 | **RSS/JSON feed request volume** (weekly requests to `/feed.xml` or `/feed.json` with non-browser User-Agents) | Proxy for programmatic feed subscribers — analysts, aggregators, citation tools. | Nginx access log: `GET /feed.xml` or `/feed.json` filtered to non-browser UA (exclude `Mozilla`) |
| 7 | **External referrals to historical briefings** (sessions from outside compassionbenchmark.com landing on `/updates/<date>`) | Directly measures citation and backlink value. Each referral is evidence the record is being used. | Umami: sessions on `/updates/2*` where referrer domain is not compassionbenchmark.com and not empty |

### Activation Metric

A historical briefing page is "activated" when a session: (a) arrives from outside the site OR (b) navigates from the archive landing to the briefing AND (c) spends > 90 seconds on the page. This threshold separates research engagement from bounces.

### Guardrail Metrics

These metrics do not define success but would trigger investigation if they move adversely:

- **Latest briefing session share does not decline**: `/updates` (latest) should remain the primary traffic entry point. If archive traffic cannibilizes latest-page sessions, the archive nav UX may be pulling users away from current content. Guard: latest-page sessions / total updates sessions should not fall below 50%.
- **RSS feed error rate**: If nginx logs show `feed.xml` returning non-200s, the pipeline has broken the feed. Zero tolerance.
- **Search no-results rate**: If `archive_search_query` events with `results_count: 0` exceed 40%, search index quality is the problem, not user intent.

### Operational Metrics (pipeline health, not product value)

- Daily briefing JSON count in `site/src/data/updates/daily/` (expect +1/day on weekdays)
- Manifest.json date count (should match daily JSON count)
- Build time increase from archive static generation (flag if > 30s increase)

---

## 2. Event Instrumentation Plan

### Umami custom events — implementation notes

Umami's cookieless model collects events via `window.umami.track(eventName, properties)`. No PII is passed in any event defined below. All properties are structural (slugs, lengths, types, dates) — never user-identifiable. See Section 7 for full privacy confirmation.

---

### Event: `archive_filter_applied`

**Trigger:** User changes a filter value on `/updates/archive` (sector dropdown, month picker, entity search input — any filter control change that updates the visible result set)

**When to fire:** On filter value commit (not on every keypress for entity search — debounce 400ms or fire on blur/enter)

**Properties:**

| Property | Type | Values | Notes |
|---|---|---|---|
| `filter_type` | string | `sector`, `month`, `entity`, `keyword` | Which filter was applied |
| `filter_value_length` | number | integer | For entity/keyword filters: character count. For sector/month: omit or set 0. Avoids capturing the actual query string. |
| `results_count` | number | integer | How many briefings match the active filter set after this change |
| `is_combination` | boolean | true/false | Whether more than one filter is active simultaneously |

**Do not include:** the actual filter string value (avoid capturing entity names or search terms as event properties, which could inadvertently log researcher intent).

---

### Event: `archive_search_query`

**Trigger:** User submits a search on the archive search surface (enter key or search button click) with a non-empty query

**Properties:**

| Property | Type | Values | Notes |
|---|---|---|---|
| `query_length` | number | integer | Character count of the submitted query |
| `results_count` | number | integer | Number of results returned. 0 = no results, useful for quality monitoring |
| `search_surface` | string | `archive_page`, `modal`, `inline` | Identifies which search UI variant fired this (relevant if A/B test runs different surfaces) |

---

### Event: `archive_result_click`

**Trigger:** User clicks a search result or a filtered briefing card to navigate to a specific historical briefing

**Properties:**

| Property | Type | Values | Notes |
|---|---|---|---|
| `result_type` | string | `search_result`, `filter_result`, `calendar_day`, `list_item` | How the result was surfaced |
| `result_date` | string | ISO date `YYYY-MM-DD` | The date of the briefing the user is navigating to |
| `result_position` | number | integer | 1-indexed rank in the result list. Useful for measuring whether top results are clicked. |
| `days_ago` | number | integer | Age of the briefing in days at time of click. Useful for detecting whether users prefer recent-archive vs deep-archive. |

---

### Event: `entity_history_loaded`

**Trigger:** The `/entity/<slug>/history` page reaches an interactive state (fire on component mount, after data has rendered — not on navigation start)

**Properties:**

| Property | Type | Values | Notes |
|---|---|---|---|
| `entity_slug` | string | slug string | e.g. `apple-inc`, `openai` |
| `entity_kind` | string | index category | e.g. `fortune-500`, `ai-labs`, `countries` |
| `event_count` | number | integer | How many score change events are shown on this history page for this entity |
| `arrival_path` | string | `archive_search`, `briefing_link`, `entity_page`, `direct` | Where in the site the user came from. Derive from document.referrer prefix at fire time. |

---

### Event: `briefing_navigated_from_archive`

**Trigger:** User navigates from one historical briefing to another via internal navigation (prev/next arrows, date nav, or inline entity link that lands on a different briefing date)

**Properties:**

| Property | Type | Values | Notes |
|---|---|---|---|
| `from_date` | string | ISO date | The briefing the user was on |
| `to_date` | string | ISO date | The briefing the user navigated to |
| `nav_mechanism` | string | `prev_arrow`, `next_arrow`, `date_nav`, `entity_link`, `timeline_click` | How the navigation was initiated |
| `depth` | number | integer | How many briefing-to-briefing navigations have occurred in this session. Depth 1 = first inter-briefing nav, depth 5 = deeply engaged researcher. |

---

### Event: `feed_subscription_referrer` (best-effort)

**Trigger:** This event cannot be fired by client-side JS since feed consumers are non-browser clients. Measurement must come from server-side Nginx logs.

**Implementation approach:**
- Nginx access log filter: `GET /feed.xml` or `GET /feed.json` where User-Agent does not contain `Mozilla`
- Parse daily via a log-processing script; write a count to a shared tally file
- Review weekly — no Umami event can cover this

**Properties tracked in log analysis (not Umami):**
- Request date
- User-Agent string (for aggregator identification — e.g. `Feedly/1.0`, `NewsBlur`)
- Referrer header if present
- Response code

This is the one metric that requires a small operational step (log parsing) rather than client-side instrumentation.

---

## 3. Funnels

### Funnel 1: SEO Discovery to Entity Depth

This funnel measures whether organic arrivals on historical briefings go beyond a single-page read and engage with the entity layer of the site.

```
Step 1: External/organic session lands on /updates/<date>
        (traffic source: search engine or external referral, not compassionbenchmark.com)
        
Step 2: Session views at least one entity mention or score-change item
        (proxy: time-on-page > 60s, OR clicks an entity link within the briefing)
        
Step 3: Session navigates to /entity/<slug> (any entity detail page)

Step 4: Session navigates to /entity/<slug>/history
        (fires: entity_history_loaded with arrival_path: 'briefing_link')
```

**Measurement:** Umami funnel report. Steps 1-3 measurable via pageview sequence. Step 4 measurable via `entity_history_loaded` event. Step 3 → 4 conversion is the deepest engagement signal. Even 5% conversion at Step 3 → 4 indicates analyst-level interest.

**Decision gate:** If Step 1 → Step 2 (time-on-page > 60s) is below 30% for organic arrivals, the briefing content is not matching search intent — investigate landing-page/query alignment before building deeper archive features.

---

### Funnel 2: Citation Path

This funnel measures whether the archive is generating external citation events — users arriving from outside, reading a dated piece of research, and taking a sharing or linking action.

```
Step 1: External referral session lands on /updates/<date>
        (referrer is not compassionbenchmark.com and not empty)
        
Step 2: Session time-on-page > 120s
        (behavioral proxy for "read the piece")
        
Step 3: User copies the URL, or navigates away to a non-site destination
        (Umami does not track clipboard; proxy: session exits directly after Step 2
         without navigating to another internal page)
```

**Measurement limitation:** Direct citation tracking (clipboard copy) is not measurable without a custom "Copy link" button that fires a Umami event. Recommend adding a `briefing_url_copied` event to any "Copy permalink" or share button on historical briefing pages. If no such button exists at launch, use exit-after-read (Steps 1+2 with immediate exit) as the proxy.

**Action:** If Step 1 → Step 2 conversion is > 40% (users arriving from external referrals and reading deeply), this is a strong signal the archive is being used as a citation source and warrants adding a `briefing_url_copied` button.

---

### Funnel 3: Research Session (Browse to Deep Read)

This funnel measures internal researcher behavior: a user entering the archive, using search or filters, and spending meaningful time on a historical briefing.

```
Step 1: Session lands on /updates/archive
        (pageview event)
        
Step 2: Session fires archive_filter_applied OR archive_search_query
        (user actively queries the archive)
        
Step 3: Session fires archive_result_click
        (user selects a result)
        
Step 4: Session time-on-page on the resulting /updates/<date> > 120s
        (fires: internal metric on /updates/[date] — use Umami avg time on page)
```

**Decision use:** If Step 2 → Step 3 conversion is below 40% (users apply filters but do not click results), either results are poor or the filter UX is confusing. If Step 3 → Step 4 time threshold is met less than 25% of the time, the search is surfacing the wrong briefings (users click and bounce).

---

## 4. Dashboard Specifications

### Dashboard 1: Archive Health

**Purpose:** Weekly check on whether the archive is being used and search is working. Primary audience: founder (Phil).

**Refresh cadence:** Weekly (review Monday mornings)

**Panels:**

| Panel | Metric | Chart type | Time window |
|---|---|---|---|
| Archive entry rate | % of /updates sessions reaching archive | Single-value KPI + 4-week trend sparkline | Rolling 7 days vs prior 7 days |
| Archive search engagement rate | archive_search_query events / archive sessions | Single-value KPI + 4-week trend | Rolling 7 days |
| Search CTR | archive_result_click / archive_search_query | Single-value KPI | Rolling 7 days |
| Search no-results rate | queries with results_count=0 / total queries | Single-value KPI (flag if > 40%) | Rolling 7 days |
| Top briefings accessed from archive | Top 10 /updates/<date> pages by sessions (excluding today's latest) | Ranked table | Rolling 7 days |
| Funnel 3 step completion | Steps 1-4 of Research Session funnel | Funnel chart | Rolling 30 days |
| Entity history page views | Total pageviews on /entity/*/history | Single-value + 4-week sparkline | Rolling 7 days |
| Top entity history pages | Top 10 slugs by pageviews | Ranked table | Rolling 30 days |
| Feed requests | Weekly feed.xml + feed.json requests (non-browser UA) | Bar chart by week | Rolling 8 weeks |
| Briefing depth distribution | Histogram of briefing_navigated_from_archive depth values | Bar chart | Rolling 30 days |

**Umami configuration note:** Umami's custom reports panel can be used for event-level panels. The "Top briefings from archive" panel requires a page filter (`/updates/2*`) excluding the manifest latest date — this may require a manual filter configuration in Umami's report builder or a simple weekly Nginx log grep if Umami's filter UI is insufficient.

---

### Dashboard 2: SEO Compounding

**Purpose:** Monthly review of whether the archive is building organic search equity over time. Primary audience: founder (Phil), referenced when making the case for continued archive investment.

**Refresh cadence:** Monthly

**Panels:**

| Panel | Metric | Chart type | Time window |
|---|---|---|---|
| Organic reach trend | Weekly sessions on historical /updates/<date> from search/referral | Line chart, week-over-week | Rolling 12 weeks |
| Historical vs latest share | Sessions on historical pages / sessions on /updates (latest) | Stacked bar, % share | Rolling 12 weeks |
| External referral sessions to historical pages | Sessions where referrer domain is not compassionbenchmark.com | Line chart | Rolling 12 weeks |
| Top referring domains | External referrer domains by session count | Ranked table, top 20 | Rolling 30 days |
| New historical pages indexed (proxy) | Count of /updates/<date> pages with any organic session (first session from search) | Cumulative line chart | All time since archive launch |
| Archive landing page organic sessions | Sessions on /updates/archive from search | Single-value + trend | Rolling 30 days |
| Deep-archive engagement | Average time-on-page for sessions on historical pages > 30 days old | Single-value | Rolling 30 days |
| SEO compounding rate | Week-over-week growth in organic sessions on historical pages | Single-value percentage | Rolling 4 weeks |

**Note on referrer data in Umami:** Umami captures the referrer header. Search engines (Google, Bing, DuckDuckGo) appear as known referrer domains or as direct traffic when HTTPS → HTTPS stripping removes the referrer. Treat sessions with empty referrer and direct URL access to historical briefings as likely organic — include them in the "organic reach" estimate with a note that they may be slightly inflated.

---

## 5. Experimentation Hooks

The following archive features are candidates for A/B testing once the archive has sufficient traffic (minimum: ~200 archive sessions/week to detect a meaningful effect with reasonable confidence). Do not run A/B tests before that threshold — the signal will be noise.

### Candidate A: Calendar widget vs. chronological list

**Hypothesis:** A calendar grid view of historical briefings may increase archive entry rate vs. a reverse-chronological list because it signals density (42 briefings visible at once) rather than recency.

**Primary metric for test:** `archive_result_click` rate per session on `/updates/archive`

**Instrumentation requirement:** `archive_result_click` must include `result_type: 'calendar_day'` vs `result_type: 'list_item'` to distinguish variant behavior. This is already specified in the event schema above.

**Secondary metric:** time-on-page on the resulting briefing (Step 4 of Funnel 3)

---

### Candidate B: Search-as-modal vs. search-as-dedicated-page

**Hypothesis:** A modal search (accessible from any `/updates/[date]` page without leaving) may increase search engagement rate because it removes navigation friction. A dedicated `/updates/archive` search page may produce higher result quality signals because users are in an intentional research mode.

**Primary metric for test:** `archive_search_query` events per session (not per visit to archive page — across all /updates/* pages)

**Instrumentation requirement:** `archive_search_query` must include `search_surface` property (already specified). The test variant determines which surface fires.

**Secondary metric:** Search CTR (`archive_result_click` / `archive_search_query`)

---

### Candidate C: Entity history page entry point — tab vs. separate page

**Hypothesis:** Adding a "History" tab on the existing entity detail page (rather than a separate `/entity/<slug>/history` route) may increase `entity_history_loaded` volume because it is reachable within the existing entity page without a navigation step.

**Primary metric for test:** `entity_history_loaded` events per 1,000 entity detail pageviews

**Note:** This experiment has a prerequisite — entity history pages must be live and accumulating baseline data first. Do not set up this experiment at launch.

---

## 6. Baselines and Targets

### Baseline state at archive launch

- Historical briefings: 42 (2026-04-15 through 2026-05-25)
- Existing `/updates/[date]` pages: live and indexed, serving organic traffic opportunistically
- Archive landing page: does not exist yet
- Entity history pages: do not exist yet
- Search: does not exist yet
- Feed: does not exist yet
- Current organic sessions on historical briefings: unknown (no measurement in place before this spec)

**Recommended first action before launch:** Install a Umami page filter for `/updates/2*` with referrer condition to establish a pre-archive baseline over the 1-2 weeks before the archive landing and search go live. This gives a "historical briefings without archive discoverability" baseline to compare against.

---

### Day-30 targets

| Metric | Target | Rationale |
|---|---|---|
| Archive entry rate | ≥ 10% of /updates sessions reach archive | Conservative given existing audience size. Any value > 0 confirms discoverability. Revisit upward at day-60. |
| Organic sessions on historical briefings | ≥ 5/day (35/week) | Low-traffic conservative target. With 42 briefings and light existing organic presence, 5/day across the full archive is achievable purely from long-tail indexing. |
| Entity history page views | ≥ 50/week total | One or two entities with active events (e.g. Turkey, Slovakia in the current cycle) will drive the majority. |
| Archive search engagement rate | ≥ 20% of archive sessions fire a search | If the search surface is visible and functional, 1 in 5 users trying it is the floor. Below 10% = discoverability problem with the search UI. |
| Search CTR | ≥ 35% | Industry baseline for useful internal search. Below 25% = relevance problem. |
| Feed requests | ≥ 10 non-browser requests/week | RSS feeds accumulate slowly. 10 requests/week at day-30 = plausible if the feed URL is listed on the site and submitted to Feedly. |

---

### Day-60 targets

| Metric | Target | Rationale |
|---|---|---|
| Organic sessions on historical briefings | ≥ 15/day (105/week) | 3x the day-30 target; assumes Google has indexed the archive landing and historical pages during the 60-day window. |
| Archive entry rate | ≥ 20% of /updates sessions | With the archive landing featured in date nav, 1 in 5 existing readers should discover it. |
| External referrals to historical briefings | ≥ 3 distinct referrer domains/week | First citations or aggregator picks. |
| Entity history page views | ≥ 200/week total | Growth driven by high-profile entities with scoring activity. |
| Deep-archive sessions (pages > 30 days old) | ≥ 10% of historical page sessions | Confirms breadth of archive use, not just recency-driven browse. |
| Feed requests | ≥ 30 non-browser requests/week | Growth from feed aggregator indexing. |

---

### Day-90 targets

| Metric | Target | Rationale |
|---|---|---|
| Organic reach (historical briefings) | ≥ 25/day (175/week) | Compounding assumption: each new briefing adds long-tail search surface. |
| Archive as share of total /updates traffic | ≥ 25% | Combined organic + direct archive sessions / total /updates sessions. |
| External referrals | ≥ 2 distinct referring domains with > 1 referral each | Repeat citation from a domain = genuine source adoption. |
| SEO compounding rate | Positive week-over-week trend for 6 of last 8 weeks | Directional confirmation that the archive is building, not plateauing. |
| Feed requests | ≥ 50 non-browser requests/week | Small but stable aggregator base established. |

**Threshold for re-evaluation:** If organic sessions on historical briefings remain below 5/day at day-60 (no growth from day-30 baseline), the primary cause is likely indexation lag or thin content for long-tail queries. At that point, the decision question is: add structured data markup to historical briefings (`NewsArticle` schema already in place), or add more content signals (sector tags, entity mention lists) to improve crawlability. This is a product decision, not a measurement failure.

---

## 7. Privacy — Umami Compatibility Confirmation

Umami operates as a cookieless analytics tool. It does not set cookies, does not fingerprint individual users, and does not persist cross-session identity. All Umami data is session-scoped and aggregated.

**Compatibility assessment for all events in this spec:**

| Event | PII risk | Assessment |
|---|---|---|
| `archive_filter_applied` | None — properties are filter type, value length (integer), result count | Compliant |
| `archive_search_query` | Low — `query_length` is an integer, not the query string itself. The actual query is never sent. | Compliant |
| `archive_result_click` | None — properties are result type, briefing date, position, days_ago. No user ID. | Compliant |
| `entity_history_loaded` | None — entity slug is a public identifier. `arrival_path` is a category string. | Compliant |
| `briefing_navigated_from_archive` | None — briefing dates are public data points. | Compliant |
| Feed request logging (Nginx) | Low — IP addresses in Nginx logs. Mitigate: use anonymize_logs directive in nginx.conf (`$remote_addr_anon` pattern) or purge access logs on a 30-day rolling basis per current Nginx config practice. | Compliant with log anonymization |

**No additional privacy policy updates are required** beyond the existing policy disclosures for Umami, provided Umami is already disclosed as an analytics tool. Feed log analysis is covered by standard server-side analytics disclosure.

**Explicit confirmation:** No event in this spec captures: email addresses, user names, IP addresses (Umami layer), scroll positions tied to identity, or any content the user types (query strings are measured by length only, never value).

---

## 8. Instrumentation Ambiguity Flags

These items require resolution before engineering implementation begins:

**Flag 1 — Umami version and custom event API.** Confirm which version of Umami is running. The `window.umami.track()` API changed between v1 (uses `trackEvent`) and v2 (uses `track`). All events in this spec use the v2 `track(name, properties)` signature. If v1 is running, property objects are not supported — events would be name-only. This would reduce the value of `archive_search_query` and `archive_result_click` significantly.

**Flag 2 — Archive landing page URL convention.** This spec assumes `/updates/archive` as the landing URL. If the routing decision uses `/updates?archive=1` or a different convention, the Umami pageview filters in Dashboards 1 and 2 must be updated before implementation.

**Flag 3 — Entity history page URL convention.** This spec assumes `/entity/<slug>/history`. If the routing decision uses `/updates/entity/<slug>` or another path, update `entity_history_loaded` arrival_path derivation logic and dashboard page filters accordingly.

**Flag 4 — Feed URL finalization.** The spec assumes `/feed.xml` and `/feed.json`. If the URLs differ, update the Nginx log filter in the feed request metric.

**Flag 5 — `arrival_path` derivation for `entity_history_loaded`.** This property requires `document.referrer` inspection at event fire time. For same-origin navigation in a Next.js SPA, `document.referrer` may be empty (SPA routing does not reload the document). The correct implementation is to read from the router's navigation history or pass a `from` query param in internal links to history pages. Frontend engineer must confirm the mechanism before the event is instrumented.

---

## Handoff

Primary consumers of this spec:
- **frontend-engineer** — implement all Umami `window.umami.track()` calls on archive landing, historical briefing pages, entity history pages, and search components
- **coordinator** — schedule Dashboard 1 (Archive Health) weekly review; schedule Dashboard 2 (SEO Compounding) monthly review
- **product-manager** — review day-30 targets against actual post-launch data; use Flag 1 resolution to confirm Umami event property support before sign-off

Feed log parsing (Section 2, `feed_subscription_referrer`) has no current owner and requires a 15-minute weekly operational step. Assign before launch.
