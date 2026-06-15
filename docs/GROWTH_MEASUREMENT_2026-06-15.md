# Growth Measurement — Traffic + Engagement Layer
**Date:** 2026-06-15
**Author:** Analytics agent
**Scope:** Metric tree, event instrumentation audit, funnel definition, dashboard spec, AEO measurement. Traffic + engagement only — revenue/KV/Listmonk instrumentation covered in `docs/REVENUE_REVIEW_ANALYTICS_2026-05-28.md`. Spec only — no code modified.
**Upstream artifacts read:** REVENUE_REVIEW_ANALYTICS_2026-05-28.md, UPDATES_REVIEW2_ANALYTICS_2026-06-10.md, METRICS_MONETIZATION.md, CONTENT_STRATEGY_CONVERSION_2026-06-10.md, REVENUE_REVIEW_GROWTH_2026-05-28.md, SEO_AEO_AUDIT_2026-06-11.md, SEO_AEO_TOP10_STRATEGY_2026-06-11.md, LINKEDIN_UTM.md, site/src/lib/analytics.ts, site/src/data/gumroad.ts

---

## 1. Metric Tree

### 1.1 North Star (Growth Phase)

**Non-branded organic sessions reaching an entity or index page, trailing 28 days.**

Rationale: This stack's growth engine is AEO/SEO citation converting to high-intent landing. The north star must be the intersection of (a) search intent not already captured by the brand (new potential readers) and (b) pages that can activate a visitor (entity and index pages, not the homepage). Revenue metrics are downstream of this; if this number grows, everything else can be made to convert. LinkedIn-driven sessions count as organic for engagement-quality purposes but should be split in the dashboard view.

Baseline: establish from GSC + Umami at the point of GSC verification (currently unconfirmed — see Precondition 0 below).
Target (90 days): 2× the day-of-measurement baseline after GSC verification is confirmed.

---

### 1.2 Metric Hierarchy

```
LAYER             METRIC                              SOURCE            CADENCE
──────────────────────────────────────────────────────────────────────────────────
NORTH STAR        Non-branded organic sessions        GSC + Umami       Weekly
                  (entity/index landing pages)

ACQUISITION
  Traffic volume  Total sessions (Umami)              Umami             Weekly
  Channel split   Sessions by utm_source              Umami             Weekly
                  (linkedin / organic / direct /
                   referral / feed)
  Query class     Branded vs non-branded clicks +     GSC               Weekly
                  impressions; top-10 non-branded
                  queries by impression
  New vs return   New visitor % (Umami)               Umami             Weekly
  Feed growth     RSS/JSON feed fetches               Nginx logs        Monthly
                  (proxy: distinct IPs on feed URLs)

ENGAGEMENT
  Depth           briefing_read_depth pct:75 /        Umami             Weekly
                  briefing page views = "deep read
                  rate" per briefing date
  Scroll          briefing_read_depth pct:90 /        Umami             Weekly
                  briefing page views = "completion
                  rate"
  Section intent  briefing_section_nav top-3          Umami             Weekly
                  section_id by click count
  Citation share  briefing_citation_copied count      Umami             Weekly
                  (absolute + by entity/sector)
  Internal CTR    updates_entity_click / briefing     Umami             Weekly
                  page views
  Pages/session   Umami built-in                      Umami             Weekly
  Time on page    Umami built-in                      Umami             Weekly
                  (treat as directional only; tab-
                   open distorts)
  Embed copy      badge_embed_copy count              Umami             Monthly
  Archive use     archive_briefing_expanded count     Umami             Weekly
                  archive_filter_applied top values

ACTIVATION
  Newsletter      newsletter_subscribed count +       Umami             Weekly
  subscribe rate  rate (events / sessions)
  Source mix      newsletter_subscribed.source        Umami             Weekly
                  breakdown (entity-page /
                  updates-completion /
                  updates-subscribe-cta /
                  updates-archive / briefing-page)
  Score-Watch     score_watch_click count             Umami             Weekly
  intent
  Return habit    briefing_returned count             Umami             Weekly
                  briefing_returned.streak_signal=
                  "adjacent" / total briefing
                  sessions = "habit proxy"

RETENTION
  Newsletter      Listmonk open rate (per send)       Listmonk          Per send
  open rate       target ≥ 45%
  Newsletter      Listmonk unsub rate (per send)      Listmonk          Per send
  unsub rate      target ≤ 2%
  Return sessions Umami new-vs-returning ratio        Umami             Weekly
                  (watch for upward returning trend)
  Feed retention  Nginx feed fetches (stable or       Nginx logs        Monthly
                  growing = health signal)

AEO CITATION      Off-site citation count: 10         Manual probe log  Monthly
  (off-site)      fixed prompts × 5 engines;
                  baseline 0 → target ≥3 engines
                  cite us by name+URL on ≥3
                  prompts within 90 days

GUARDRAILS
  Independence    integrity-check.mjs pass/fail       Script exit code  Weekly
  check           (STOP condition on fail)
  Error rate      newsletter_subscribe_error /        Umami             Weekly
                  newsletter_subscribed ≤ 5%
  Structured      Rich Results Test: 0 errors on      Manual / CI       Per
  data validity   1 sample per template (8            Rich Results      schema
                  templates)                          Test              change
```

---

### 1.3 Baselines and Targets

All baselines are to be established at the moment GSC is verified and Umami is confirmed live in production (Precondition 0). Until then, these are targets relative to baseline.

| Metric | Baseline | 30-day target | 90-day target | Decision trigger |
|---|---|---|---|---|
| Non-branded organic sessions (entity/index) | establish at GSC verify | +30% | +100% | <+10% at 30d: AEO schema sprint (Wave 1 items 3.1+3.2) likely blocked; check indexation |
| LinkedIn sessions (utm_source=linkedin) | establish at first tagged post | track trend | +50% vs weeks 1-4 | Flat for 3+ weeks: check post cadence; confirm UTMs applied |
| New visitor % | establish | maintain >60% | maintain >60% | <50%: growth is recycling existing audience, not expanding |
| briefing deep read rate (pct:75) | establish | — | ≥40% of briefing views | <25% on 3+ consecutive briefings: editorial length/structure review |
| briefing completion rate (pct:90) | establish | — | ≥25% of briefing views | — |
| newsletter_subscribed rate (events/sessions) | establish | 1.5% | 2.5% | <0.5% for 2+ weeks: CTA placement or form review |
| newsletter source: updates-completion | 0 (not yet instrumented) | — | ≥30% of newsletter signups | Completion-block CTA not shipping? |
| briefing_citation_copied | 0 (not yet instrumented) | — | track trend | — |
| briefing_returned (habit proxy) | 0 (not yet instrumented) | — | ≥15% of briefing sessions | — |
| AEO citations (manual probe) | 0 | 0 (establish prompts) | ≥3 engines, ≥3 prompts | 0 at 90d: check llms.txt + typed JSON-LD (Wave 1 items) |
| newsletter open rate | establish from Listmonk | ≥45% | ≥45% | <25% on any send: subject line / deliverability check |
| newsletter unsub rate | establish | ≤2% | ≤2% | >5% on any single send: content review |
| Structured data validity | incomplete (per SEO audit) | 0 errors on 8 templates | maintained | Any error after a schema change: rollback |

---

## 2. The Funnel

### 2.1 Five-stage funnel

```
STAGE         DESCRIPTION                          PRIMARY SIGNAL
──────────────────────────────────────────────────────────────────────────────────
LAND          Visitor reaches the site.            Umami session (utm_source split)
              Sources: LinkedIn (tagged UTM),       GSC impressions → clicks
              organic search, direct, referral,     Nginx feed fetches
              feed reader.

UNDERSTAND    Visitor reads enough to grasp the     briefing_read_depth pct:25
              institution's purpose. On /updates:   Time on page > 60s (directional)
              first section of briefing. On an      pages/session > 1
              entity page: hero score block.
              On an index: ranking table.

ENGAGE        Visitor takes an active signal        briefing_citation_copied
              action: copies a citation, clicks a   briefing_section_nav
              section, clicks an entity link from   updates_entity_click
              a briefing, copies an embed badge,    badge_embed_copy
              reaches deep read (pct:75).           briefing_read_depth pct:75

SUBSCRIBE     Visitor gives their email (free)      newsletter_subscribed
(ACTIVATE)    or demonstrates paid intent.          + source property
              Free: newsletter signup.              score_watch_click
              Paid-intent: score_watch_click,       gumroad_click
              gumroad_click.

RETURN        Visitor is not a one-time reader;     briefing_returned
              habit or follow-up intent is          newsletter open (Listmonk)
              established.                          Returning visitor % (Umami)
                                                    Feed fetch cadence (Nginx)
```

### 2.2 Where the drop-offs will be

**Land → Understand (largest volume loss).**
Most visitors who land on /updates or an entity page will not reach the first content section. High bounce is expected and acceptable for cold traffic from LinkedIn or generic organic queries. The fix is not lower bounce — it is landing on higher-intent pages for higher-intent queries. AEO/SEO work (typed JSON-LD, answer-first sentences, superlative index titles) shifts the landing distribution toward pages where the query already implies understanding intent.

**Understand → Engage (the editorial quality gate).**
Readers who start the briefing but do not reach pct:75 are dropping between the lead signal section and the editorial synthesis cluster. This is the signal that tells the digest agent whether the briefing is holding attention through its mid-section. The deep-read rate per briefing date is the primary editorial feedback metric. Drop-off here is structural (briefing too long, mid-section weak) rather than attributable to channel.

**Engage → Subscribe (the CTA placement problem, already diagnosed).**
The conversion strategy review (`CONTENT_STRATEGY_CONVERSION_2026-06-10.md`) identifies the root issue: the primary subscribe CTA fires before value is delivered (header), and the highest-intent pixel (CompletionBlock "You're all caught up") has no CTA. The source property on `newsletter_subscribed` will reveal whether the completion-block CTA, once added, changes the mix. Until that fix ships, expect most subscriptions to come from the inline SubscribeCTA block (post-briefing), which is the second-best placement.

**Subscribe → Return (the email is the bridge).**
Once the reader subscribes, return behavior is driven by Listmonk delivery quality (open rate, not-spam classification) and briefing value. A subscriber who opens the Friday email returns to the site to read the full briefing. The `briefing_returned` event with `streak_signal="adjacent"` is the leading indicator that the email-to-site loop is working.

**The AEO citation gap (non-funnel but critical).**
Organic growth from answer engines does not pass through the above funnel — it appears as new sessions landing directly on entity or index pages from search, with no UTM. GSC non-branded impressions + the manual AEO probe are the only ways to measure this. There is no Umami-only answer to "are answer engines citing us."

---

## 3. Event Instrumentation Plan

### 3.1 Audit: What is currently in `analytics.ts`

The `EVENTS` constant and codebase confirm these events are defined and have known instrumentation points:

| Event name | Status | Where |
|---|---|---|
| `score_watch_click` | Live (Gumroad path) / MISSING (manual path) | `EntityDetail.tsx` via `Button.trackAs` |
| `score_watch_signup` | Live (manual-fulfillment form submit) | `SalesInquiryForm.tsx:98` |
| `purchase_confirmed` | Defined but UNRELIABLE (Gumroad redirect config unverified) | `ThankYouClient.tsx:79` |
| `badge_embed_copy` | Defined in EVENTS constant | `BadgeEmbedWidget.tsx:31` |
| `supporter_click` | Defined in EVENTS constant | `SupporterCta.tsx:24` via `Button.trackAs` |
| `api_access_click` | Defined in EVENTS constant | `ApiAccessCta.tsx:18` via `Button.trackAs` |
| `newsletter_subscribed` | Live | `NewsletterSignup.tsx:94,108` |
| `newsletter_subscribe_error` | Live | `NewsletterSignup.tsx:99,111,115` |
| `contact_sales_submitted` | Live | `SalesInquiryForm.tsx:88` |
| `contact_sales_error` | Live | `SalesInquiryForm.tsx:106,112` |
| `gumroad_click` | Live (external Gumroad links via Button) | `Button.tsx:50` |
| `ranking_entity_click` | Live | `RankingTable.tsx:176` |
| `ranking_table_search` | Live | `RankingTable.tsx:109` |
| `ranking_table_filter` | Live | `RankingTable.tsx:215` |
| `ranking_table_sort` | Live | `RankingTable.tsx:237` |
| `entity_search_result_click` | Live | `EntitySearch.tsx:195` |
| `updates_entity_click` | Live | `TrackedEntityLink.tsx:45` |
| `briefing_read_depth` | Defined in EVENTS constant; NOT YET WIRED | `ReadingProgress.tsx` (no trackEvent call) |
| `briefing_citation_copied` | Defined in EVENTS constant; NOT YET WIRED | `StatOfTheDay.tsx` (no trackEvent call) |
| `briefing_section_nav` | Defined in EVENTS constant; NOT YET WIRED | `BriefingJumpNav.tsx` (no onClick) |

Events confirmed already instrumented by prior analytics work but NOT yet in the `EVENTS` constant:
- `entity_newsletter_subscribed` — `EntityNewsletterCapture.tsx:104` fires with `{entity_slug, backend}`

---

### 3.2 Missing events to add

Listed in priority order (highest decision value first). All are Umami `trackEvent()` calls — static-export-safe, SSR-safe (the existing wrapper handles `typeof window === "undefined"` check), no-op if Umami is absent.

---

**MISSING-1: `briefing_read_depth`**
Trigger: scroll milestone in `ReadingProgress.tsx`
Fire at: 25%, 50%, 75%, 90% — each fires once per page load (guard with `useRef<Set<number>>`)
Properties: `{ pct: 25 | 50 | 75 | 90, date: string }` (date = briefing date, passed as prop from `DailyBriefing`)
Where: `site/src/components/updates/briefing/ReadingProgress.tsx` — in the existing scroll handler, after the `setProgress(pct)` call
Note: The `EVENTS.BRIEFING_READ_DEPTH` constant already exists in `analytics.ts`. The wire is missing only in `ReadingProgress.tsx`.
Informs: deep read rate per briefing, completion rate, editorial length decisions, briefing_returned dependency

---

**MISSING-2: `briefing_citation_copied`**
Trigger: clipboard copy action in `StatOfTheDay.tsx`
Properties: `{ date: string, stat_label: string, entity: string | null }`
Where: `site/src/components/updates/briefing/StatOfTheDay.tsx` — inside `handleCopy()`, after `setCopied(true)`
Note: `EVENTS.BRIEFING_CITATION_COPIED` constant already exists. Wire is missing.
Informs: citation-share behavior, which entity types and briefing dates generate external sharing, AEO amplification signal

---

**MISSING-3: `briefing_section_nav`**
Trigger: jump-nav chip click in `BriefingJumpNav.tsx`
Properties: `{ section_id: string, section_label: string, date: string }`
Where: `site/src/components/updates/briefing/BriefingJumpNav.tsx` — add `onClick` handler to each chip `<a>` element; pass `briefingDate` as a new prop from `DailyBriefing`
Note: `EVENTS.BRIEFING_SECTION_NAV` constant already exists.
Informs: section gravity ranking, editorial ordering feedback for digest agent, audit trail section engagement

---

**MISSING-4: `briefing_returned`**
Trigger: page mount on `/updates/[date]` when `localStorage.getItem("cb_last_read")` is within 3 calendar days of the current briefing date
Properties: `{ days_since_last: number, streak_signal: "adjacent" | "gap" }`
Side effect: when `briefing_read_depth pct:90` fires, write `localStorage.setItem("cb_last_read", props.date)` — this is the "earn the write" condition so only completed reads set the return signal
Where: thin client wrapper on the `/updates/[date]` page (or inside `ReadingProgress.tsx` on the pct:90 branch); the mount-time check goes in a `useEffect`
Dependency: MISSING-1 (`briefing_read_depth`) must be wired first
Privacy note: `localStorage` key stores only the briefing date string. No email, no identity. User-clearable. Complies with the no-third-party-sharing design.
Informs: daily-habit proxy (adjacent returners / total briefing sessions), habit-to-conversion relationship

---

**MISSING-5: `archive_briefing_expanded`**
Trigger: row expand toggle in `ArchiveList.tsx`
Properties: `{ date: string, score_changes: number, has_methodology_ruling: boolean }`
Where: `site/src/components/updates/ArchiveList.tsx` — inside the `toggle()` callback at line 69
Informs: which briefing dates attract archive curiosity, expand-to-open ratio for band-crossing vs. sub-threshold briefings

---

**MISSING-6: `archive_briefing_opened`**
Trigger: "Read full briefing" link click in `ArchiveList.tsx`
Properties: `{ date: string, entry_point: "archive-expand-preview" }`
Where: `site/src/components/updates/ArchiveList.tsx` — `onClick` on the "Read full briefing" `<Link>` (around line 212)
Informs: archive-to-full-read conversion, which briefings convert browsers to readers

---

**MISSING-7: `archive_filter_applied`**
Trigger: filter control changes in `ArchiveList.tsx` (sector, month, entity text)
Properties: `{ filter_type: "sector" | "month" | "entity", value: string }`
Where: `site/src/components/updates/ArchiveList.tsx` — in `onSectorChange`, `onMonthChange`, and the entity filter handler
Informs: which sectors and entities drive archive research behavior; direct input for digest agent editorial prioritization

---

**MISSING-8: `subscribe_submit` on briefing completion block**
Trigger: `newsletter_subscribed` fires with `source="updates-completion"` — this event already exists BUT the `CompletionBlock` does not yet have a `NewsletterSignup` embedded (that is a CTA placement fix, not an instrumentation fix). Once `NewsletterSignup variant="inline-compact" source="updates-completion"` is added to `CompletionBlock.tsx`, the existing `newsletter_subscribed` event automatically carries the `source` property — no new event name needed.
Where: `site/src/components/updates/briefing/CompletionBlock.tsx` — add `<NewsletterSignup>` component; the existing instrumentation on `NewsletterSignup.tsx` handles the event.
Informs: whether peak-intent placement converts better than header placement (compare `newsletter_subscribed.source` distribution before and after)

---

**MISSING-9: `score_watch_click` on manual-fulfillment path**
Already documented in `METRICS_MONETIZATION.md` §1 MISSING EVENTS. The `else` branch in `EntityDetail.tsx` that routes to `/contact-sales` when `SCORE_WATCH.useGumroad = false` should carry `trackAs="score_watch_click"` on the `Button` so the click-to-abandon rate is visible even before Gumroad is live.
Properties: same as the live path — `{entity_slug, entity_kind, entity_name, fulfillment: "manual"}`
Informs: click rate in manual-fulfillment mode, establishing baseline before Gumroad flip

---

**MISSING-10: `embed_cited` (dataset download / cite-widget copy)**
Trigger: when the "Cite this page" widget (proposed in SEO strategy) copies a citation string, or a user downloads a dataset CSV (once those exist per `SEO_AEO_TOP10_STRATEGY_2026-06-11.md` item #2)
Properties: `{ page_type: "entity" | "index", entity_slug?: string, index_slug?: string, format: "citation_copy" | "csv_download" | "json_download" }`
Where: cite-widget component (not yet built) and dataset download links
Note: This event does not exist yet because the widget/downloads don't exist yet. Define the event name now so it is stable when those features ship.
Informs: AEO amplification behavior (who is reusing the data), dataset product demand

---

### 3.3 Events NOT needed (exclusions)

- Per-entity page view tracking beyond Umami's automatic pageview: Umami already records path + referrer on every page load. A custom event would double-count and add no new dimension.
- Feed reader subscriber count via Umami: structurally impossible on static files; Nginx logs are the only proxy. No Umami event is the right answer here.
- Server-side events (alert delivery, score change detection): these belong in `research/alert-deliveries/<date>.json` (already exists). Umami cannot instrument server scripts. Do not create a client-side proxy event for server-side facts.
- Identity-linked events: no email, session ID, or IP should appear in any event property. Umami is cookieless by design; keep it that way.

---

### 3.4 Event taxonomy summary (complete, post-additions)

Stable snake_case names. Do not rename without a migration — these become permanent Umami dashboard identifiers.

```
CATEGORY          EVENT NAME                    KEY PROPERTIES                         STATUS
─────────────────────────────────────────────────────────────────────────────────────────────
Acquisition       (Umami auto-pageview)         path, referrer, utm_*                  Live (auto)
                  ranking_entity_click          slug, kind, index, rank                Live
                  ranking_table_search          query, index                           Live
                  ranking_table_filter          filter, value, index                   Live
                  ranking_table_sort            column, direction, index               Live
                  entity_search_result_click    slug, kind, index, position            Live

Briefing          briefing_read_depth           pct, date                              MISSING-1
engagement        briefing_citation_copied      date, stat_label, entity               MISSING-2
                  briefing_section_nav          section_id, section_label, date        MISSING-3
                  briefing_returned             days_since_last, streak_signal         MISSING-4
                  updates_entity_click          slug, index, source                    Live

Archive           archive_briefing_expanded     date, score_changes,                   MISSING-5
engagement                                      has_methodology_ruling
                  archive_briefing_opened       date, entry_point                      MISSING-6
                  archive_filter_applied        filter_type, value                     MISSING-7

Activation        newsletter_subscribed         source, variant, backend               Live
                  newsletter_subscribe_error    source, variant, backend,              Live
                                                errorStage
                  entity_newsletter_subscribed  entity_slug, backend                   Live
                  score_watch_click             entity_slug, entity_kind,              Live (Gumroad
                                                entity_name, fulfillment               path) /
                                                                                       MISSING-9
                                                                                       (manual path)
                  score_watch_signup            entity_slug, entity_kind,              Live
                                                entity_name

Conversion        gumroad_click                 product, href                          Live
                  purchase_confirmed            product, entity                        Live (UNRELIABLE
                                                                                       — redirect
                                                                                       config unverified)
                  contact_sales_submitted       service_interest, has_organization     Live
                  contact_sales_error           service_interest, reason               Live
                  supporter_click               href, source                           Live (when
                                                                                       useGumroad=true)
                  api_access_click              href                                   Live (when
                                                                                       useGumroad=true)

Entity pages      badge_embed_copy              entity_slug, entity_kind               Live
                  embed_cited                   page_type, entity_slug?,               MISSING-10
                                                index_slug?, format                    (future feature)
```

---

## 4. Dashboard Spec

Single-surface weekly review. Everything fits in one browser tab — one Umami session + one Listmonk session + one GSC session. No data warehouse, no export pipeline.

### 4.1 Weekly Review Dashboard (every Monday, ~20 minutes)

**Panel 1 — Traffic (Umami: last 7 days vs. prior 7 days)**

| What to look at | Umami path | Act if |
|---|---|---|
| Total sessions | Overview → Sessions | Down >20% WoW without a known cause |
| Sessions by utm_source | Sources → Referrers; filter utm_source | LinkedIn flat 3+ weeks: check post cadence + UTM tagging |
| New vs returning visitor % | Overview → Visitors (new/returning split) | Returning >40%: growth is recycling; check organic acquisition |
| Top landing pages | Pages → by sessions, filter path contains "/country/" or "/fortune-500/" or "/ai-lab/" etc. | If /updates dominates but entity/index pages are low: briefings not driving discovery |

**Panel 2 — Engagement (Umami: last 7 days)**

| What to look at | Umami path | Act if |
|---|---|---|
| briefing_read_depth distribution | Events → filter name=briefing_read_depth; group by pct property | pct:75 < 30% of page views on ≥3 consecutive briefing dates: editorial length review |
| briefing_citation_copied count | Events → filter name=briefing_citation_copied | Zero for 2+ weeks: check StatOfTheDay instrumentation (MISSING-2); watch for AEO amplification correlation |
| updates_entity_click / briefing page views | Events → filter name=updates_entity_click; divide by briefing page views | Declining: entity links in briefings getting less prominent or relevant |
| briefing_returned habit proxy | Events → filter name=briefing_returned, streak_signal=adjacent | Flat or declining: email delivery or content freshness issue |

**Panel 3 — Activation (Umami: last 7 days)**

| What to look at | Umami path | Act if |
|---|---|---|
| newsletter_subscribed count + rate | Events → filter name=newsletter_subscribed; divide by sessions | Rate <0.5% for 2+ weeks: CTA placement issue (check source distribution) |
| newsletter_subscribed source breakdown | Events → filter name=newsletter_subscribed; group by source property | "updates-completion" = 0%: CompletionBlock CTA not yet added (see MISSING-8) |
| score_watch_click count | Events → filter name=score_watch_click | Zero in a week: check SCORE_WATCH.useGumroad flag and manual-path tracking (MISSING-9) |

**Panel 4 — Email health (Listmonk: last 7 days)**

| What to look at | Listmonk path | Act if |
|---|---|---|
| Open rate on last send | Campaigns → Transactional → latest send | <25%: deliverability check (SPF/DKIM); subject line review |
| Unsub rate on last send | Same | >5% on any single send: content review; check that alert fired on real data, not artifact |
| Subscriber count trend | Subscribers → filter list = newsletter | Declining: check that newsletter_subscribed events correlate (if events fire but Listmonk count drops, check API/fallback routing) |

**Panel 5 — GSC (Google Search Console: last 28 days vs. prior 28 days)**

| What to look at | GSC path | Act if |
|---|---|---|
| Total clicks branded vs. non-branded | Performance → Search type=Web; filter query contains "compassion benchmark" for branded; all other = non-branded | Non-branded clicks flat at 0: AEO/SEO Wave 1 items not yet shipped or not yet indexed |
| Top 10 non-branded queries by impressions | Performance → Queries; sort by impressions; exclude brand | Low impressions on "most compassionate countries" class: answer-first sentences not yet indexed |
| Indexation coverage | Coverage → Indexed count vs. sitemap submitted | <95%: check for crawl errors; confirm GSC verification token in place |

---

### 4.2 Monthly Review (first Monday of each month, ~45 minutes)

**Supplement the weekly panels with:**

1. **AEO citation probe.** Run the 10 fixed prompts (defined in 4.3 below) across ChatGPT, Perplexity, Gemini, Claude, Google AI Overview. Record results in `research/aeo-citation-log/YYYY-MM.md`. Count: how many engines cite us by name + URL on how many prompts. Compare month-over-month.

2. **Feed proxy.** Check Nginx access logs for `/updates/feed.xml` and `/updates/feed.json` distinct IPs over the month. Trend line only (not a hard target until baseline established).

3. **Structured data validity spot-check.** Run one page per template (8 templates) through Rich Results Test. Record pass/fail. Any new error after a schema change is a rollback trigger.

4. **Source attribution review.** For `newsletter_subscribed`, look at the source distribution for the full month. Compare with the prior month. Identify which surfaces are growing or declining as signup sources.

5. **Embed and citation count.** Once `embed_cited` is instrumented: count events by `format` (citation_copy vs. csv_download). Cross-reference with GSC Links report for new referring domains. If referring domains are growing, the data-as-product strategy (SEO top-10 item #2) is working.

---

### 4.3 AEO Citation Probe — 10 Fixed Prompts

Run monthly. Always the same prompts, same order, across all 5 engines. Record the engine response summary, whether Compassion Benchmark was named, and whether a URL was included.

Log format: `research/aeo-citation-log/YYYY-MM.md`

```
1.  "What is the most compassionate country in the world in 2026?"
2.  "Which Fortune 500 companies rank lowest on institutional compassion?"
3.  "What is OpenAI's compassion score?"
4.  "Which AI labs have the best human welfare records?"
5.  "What is the Compassion Benchmark?"
6.  "How is institutional compassion measured?"
7.  "Which countries are in the Critical band on the Compassion Benchmark?"
8.  "What is [specific entity]'s rank among AI labs for ethical conduct?"
    (rotate entity: Anthropic, DeepMind, Meta AI — use a different one each month)
9.  "Most compassionate tech companies 2026"
10. "Institutional compassion framework"
```

Score each month: N engines citing by name+URL / (10 prompts × 5 engines) = citation rate. Target: ≥3 engines cite on ≥3 prompts by month 3 (90 days from first probe).

---

## 5. Measuring AEO Citations and Organic on This Stack

### 5.1 What Umami can and cannot see

Umami records every session that loads the site. It does NOT distinguish a visitor who came because an LLM cited us from a visitor who found us through a regular search result. Both arrive with `utm_source` absent and referrer set to the search engine (or empty for direct navigation from an LLM response). The distinction is unmeasurable at the session level on this stack.

What Umami CAN see:
- Sessions where referrer = google.com / bing.com (organic search)
- Sessions where the landing page is an entity or index page with a non-branded path (correlates with non-branded query arrival)
- Volume trend: if AEO citations drive traffic, total sessions from organic referrers will grow even if the specific prompt is invisible

What GSC CAN see:
- The exact queries that drove clicks to each page
- Impressions (how often we appeared in a SERP, including AI Overviews — Google does report these as "AI Overview" appearance in Search type filter)
- Click-through rate by query
- Non-branded impression growth is the leading indicator that AEO work is paying off

What requires manual probing:
- Whether answer engines (ChatGPT, Perplexity, Claude, Gemini) cite us by name is not in any automated signal. Manual probing (section 4.3) is the only method and is correct for this stack.

### 5.2 The monthly AEO citation log

Store in: `research/aeo-citation-log/YYYY-MM.md`

This mirrors the existing `research/integrity-reports/` and `research/alert-deliveries/` cadence — a committed, dated file per month. It creates an audit trail of citation growth that can be referenced in future SEO/AEO work.

Minimal file format:
```markdown
# AEO Citation Log — YYYY-MM
**Probed:** YYYY-MM-DD
**Prober:** [name]

| Prompt | ChatGPT | Perplexity | Gemini | Claude | Google AI Overview |
|---|---|---|---|---|---|
| 1. Most compassionate country | [cited / not cited] | ... | ... | ... | ... |
...

**Summary:** N/10 prompts cited on ≥1 engine. N engines cited us on ≥1 prompt.
**Notable:** [Any new citation pattern or missing attribution to flag for SEO action]
```

### 5.3 GSC + Bing Webmaster setup (Precondition 0)

GSC and Bing Webmaster verification are the precondition for all acquisition-side measurement. Without them, non-branded impressions, query-class data, indexation coverage, and Core Web Vitals are all unmeasurable. The SEO audit (`SEO_AEO_AUDIT_2026-06-11.md`, finding 6.1) confirms these are unverified.

Verification method for this stack: drop a static token file in `site/public/` (e.g., `site/public/googleXXX.html` for GSC, `BingSiteAuth.xml` for Bing). Both are static-export-safe.

This is the first action before any other measurement target is meaningful.

---

## 6. Preconditions: What Must Be True Before the Metrics Mean Anything

Listed in dependency order.

**Precondition 0 — Umami live in production + GSC/Bing verified**
If `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is not set in the Docker build environment, all client-side events are silent no-ops. Verify: load the live site, open browser dev tools, confirm `window.umami` is defined after the script loads. If undefined, all metric baselines are zero not because there is no traffic but because there is no instrumentation.
GSC: verify via static token file. Without it, the acquisition layer has no query-class data.
Action: Phil verifies both before the first weekly review.

**Precondition 1 — MISSING-1 through MISSING-4 wired (briefing engagement layer)**
The entire engagement panel of the dashboard is dark until `briefing_read_depth`, `briefing_citation_copied`, `briefing_section_nav`, and `briefing_returned` are wired. These four events are the core engagement signal for the primary content surface (`/updates`). They are spec'd; they need frontend instrumentation.

**Precondition 2 — LinkedIn posts carry UTMs**
LinkedIn-attributed sessions are only measurable if posts use the convention in `LINKEDIN_UTM.md`. Without UTMs, LinkedIn traffic is invisible in the channel split and appears as "direct." Check that every post published carries all four parameters.

**Precondition 3 — score_watch_click on manual-fulfillment path (MISSING-9)**
Until Gumroad is live and `SCORE_WATCH.useGumroad = true`, the Score-Watch intent signal is blind in Umami. MISSING-9 (adding `trackAs` to the contact-sales fallback button) at minimum gives a click count in the interim.

---

## 7. Interpretation Guidance

**"Deep read rate went up — does that mean the briefing improved?"**
Not necessarily in isolation. Deep read rate can rise because (a) editorial quality improved, (b) the visiting population shifted toward higher-intent readers (e.g., more LinkedIn organic from a good post), or (c) a shorter briefing requires less scroll to reach 75%. Always look at it alongside total briefing page views and the utm_source split for that week. A higher deep read rate on lower page views may mean audience quality improved but distribution fell.

**"newsletter_subscribed rate is flat even though the CompletionBlock CTA was added."**
Check the source distribution. If `source="updates-completion"` is a non-trivial % but the overall rate is flat, the completion-block CTA is working but another source is declining (e.g., the inline SubscribeCTA is getting fewer impressions). Isolated rate is the wrong unit; look at both count and source mix.

**"AEO citation count went up but organic sessions are flat."**
This is expected for the first 60 days after schema changes. Answer engines crawl and index changes with a lag; citation behavior may already be growing in untracked LLM conversations before it shows up as GSC clicks. Treat AEO citation count (manual probe) and GSC non-branded impressions as leading indicators that run 30-60 days ahead of measurable traffic impact.

**"GSC shows impressions growing but clicks are flat."**
CTR problem, not an indexation problem. Check the top queries by impression in GSC — if we are appearing for non-branded queries but not clicking through, the title/description is not matching query intent. The SEO audit's finding 2.2 (index page titles miss the superlative query) is the most likely cause for index pages; finding 4.2 (no answer-first lead sentence) is the cause for entity pages.

**"briefing_returned is low even though newsletter open rate is high."**
The email-to-site loop may be working (people open the email) but they are not clicking through to the site. Check: does the Friday email contain a clear "read the full briefing" link? If open rate is strong but briefing_returned is near-zero, the email content may be satisfying the reader without bringing them back.

---

## 8. Handoffs

**frontend-engineer:** Wire MISSING-1 (`briefing_read_depth` in `ReadingProgress.tsx`), MISSING-2 (`briefing_citation_copied` in `StatOfTheDay.tsx`), MISSING-3 (`briefing_section_nav` in `BriefingJumpNav.tsx`), MISSING-4 (`briefing_returned` in `/updates/[date]` page wrapper, depends on MISSING-1), MISSING-5 through MISSING-7 (archive events in `ArchiveList.tsx`), MISSING-9 (`score_watch_click` trackAs on manual-fulfillment button in `EntityDetail.tsx`). For MISSING-8: add `<NewsletterSignup variant="inline-compact" source="updates-completion">` to `CompletionBlock.tsx` — no new event name, existing instrumentation carries the source property.

**Phil / ops:** Verify Umami is live in production (`window.umami` defined on live site). Drop GSC and Bing Webmaster verification token files in `site/public/`. Submit sitemap to both consoles. These are Precondition 0.

**Phil / growth:** Ensure every LinkedIn post uses the full UTM convention from `LINKEDIN_UTM.md`. Check that past posts without UTMs are not mixed into the channel baseline.

**coordinator:** Sequence the frontend wiring work — MISSING-1 is the dependency gate for MISSING-4. MISSING-1 through MISSING-3 can ship together. MISSING-4 ships after MISSING-1 is confirmed live. Archive events (MISSING-5 through MISSING-7) can ship independently at any time.

**digest agent / editorial:** Once MISSING-1 through MISSING-3 are live, the weekly editorial feedback query is: (1) `briefing_read_depth pct:75` count / total briefing page views per date = deep read rate, (2) `briefing_section_nav` top-3 section_ids by click count, (3) `briefing_citation_copied` count by entity. These three numbers per briefing cycle drive editorial ordering, StatOfTheDay selection, and length decisions.

---

*Analytics agent | 2026-06-15 | Spec only — no code modified. Downstream: frontend-engineer (MISSING-1 to MISSING-9), Phil/ops (Precondition 0), coordinator (sequencing), digest-agent (editorial feedback loop queries).*
