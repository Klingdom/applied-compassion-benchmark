# Metrics & Measurement Plan — Monetization Expansion

**Version:** 1.0  
**Date:** 2026-05-17  
**Phase:** MEASURE  
**Scope:** Score-Watch end-to-end, US Cities/States products, Supporter tier, API-access marketing page, badge/embed widget, thank-you page

---

## 1. Event Taxonomy

All events flow through `trackEvent()` in `site/src/lib/analytics.ts`. Umami receives them via the proxied `/u/` endpoint. Event names are stable snake_case identifiers — do not rename without a migration.

| Event name | Trigger | Required properties | Where defined (file:line) | Funnel role |
|---|---|---|---|---|
| `score_watch_click` | Entity-page Subscribe button click (when `SCORE_WATCH.useGumroad = true`) | `entity_slug`, `entity_kind`, `entity_name`, `href` | `site/src/components/entity/EntityDetail.tsx:437` via `Button.trackAs` | Score-Watch top-of-funnel |
| `score_watch_signup` | Contact-sales form submit with `service === "score-watch"` (manual fulfillment path, `useGumroad = false`) | `entity_slug`, `entity_kind`, `entity_name` | `site/src/components/purchase/SalesInquiryForm.tsx:98` | Score-Watch fallback funnel; also fires as backward-compat alias when noted in dashboard |
| `purchase_confirmed` | `/thank-you` page mount after URL params resolve | `product` (e.g. `"score-watch"`, `"us-cities-index"`, `"supporter"`), `entity` (nullable) | `site/src/app/thank-you/ThankYouClient.tsx:79` | Bottom-of-funnel conversion for all products |
| `badge_embed_copy` | Clipboard copy click on entity-page embed widget | `entity_slug`, `entity_kind` | `site/src/components/entity/BadgeEmbedWidget.tsx:31` | Badge/embed engagement |
| `supporter_click` | Supporter CTA button click (when `SUPPORTER.useGumroad = true`) | `href`, `source` (`"tier-card"` or `"hero"`) | `site/src/app/supporters/SupporterCta.tsx:24` via `Button.trackAs` | Supporter funnel top |
| `api_access_click` | API-access page CTA click (when `API_ACCESS.useGumroad = true`) | `href` | `site/src/app/api-access/ApiAccessCta.tsx:18` via `Button.trackAs` | API funnel top |
| `newsletter_subscribed` | NewsletterSignup form success (Listmonk primary or Formspree fallback) | `source`, `variant`, `backend` (`"listmonk"` or `"formspree"`) | `site/src/components/ui/NewsletterSignup.tsx:94,108` | Newsletter conversion |
| `newsletter_subscribe_error` | NewsletterSignup form failure | `source`, `variant`, `backend`, `errorStage` | `site/src/components/ui/NewsletterSignup.tsx:99,111,115` | Diagnostic — not a funnel step |
| `contact_sales_submitted` | Contact-sales form submit (any product, non-score-watch) | `service_interest`, `has_organization` | `site/src/components/purchase/SalesInquiryForm.tsx:88` | Manual-path conversion signal |
| `contact_sales_error` | Contact-sales form submit failure | `service_interest`, `reason` (optional) | `site/src/components/purchase/SalesInquiryForm.tsx:106,112` | Diagnostic |
| `gumroad_click` | Any external Gumroad link clicked via `Button` without an explicit `trackAs` | `product` (key from `gumroad.ts`), `href` | `site/src/components/ui/Button.tsx:50` | Generic Gumroad intent signal for products without dedicated events |
| `ranking_entity_click` | Row click in RankingTable | `slug`, `kind`, `index`, `rank` | `site/src/components/index/RankingTable.tsx:176` | Index-page engagement; upstream of Score-Watch funnel |
| `ranking_table_search` | Search query in RankingTable (debounced) | `query`, `index` | `site/src/components/index/RankingTable.tsx:109` | Discovery signal |
| `ranking_table_filter` | Filter applied in RankingTable | `filter`, `value`, `index` | `site/src/components/index/RankingTable.tsx:215` | Discovery signal |
| `ranking_table_sort` | Sort applied in RankingTable | `column`, `direction`, `index` | `site/src/components/index/RankingTable.tsx:237` | Discovery signal |
| `entity_search_result_click` | Result clicked in EntitySearch | `slug`, `kind`, `index`, `position` | `site/src/components/index/EntitySearch.tsx:195` | Discovery signal |
| `updates_entity_click` | Entity link clicked in the Updates/daily briefing component | `slug`, `index`, `source` | `site/src/components/updates/TrackedEntityLink.tsx:45` | Content engagement |

### MISSING EVENTS

These events should exist but are not currently wired up. Listed with recommended insertion points.

| Missing event | Recommended trigger | Recommended file | Reason |
|---|---|---|---|
| `score_watch_click` (when `useGumroad = false`) | Contact-sales button click on entity page (the `else` branch in `EntityDetail.tsx:447`) | `site/src/components/entity/EntityDetail.tsx` — add `trackAs="score_watch_click"` and `trackData` to the fallback `<Button>` | Without this, the Umami leading indicator (§4 PRD) is blind during manual-fulfillment mode. Only `score_watch_signup` fires after form submit, so the click → abandon rate is invisible. |
| `purchase_research_click` | Click on any product card on `/purchase-research` that routes to a live Gumroad URL | `site/src/app/purchase-research/` — each product card Button should carry `trackAs="purchase_research_click"` with `product` and `index` | Currently only `gumroad_click` fires for these. That event is correct but lacks the page context needed to measure `/purchase-research` funnel step separately from entity-page CTAs. |
| `score_watch_alert_delivered` | `research/scripts/send-alerts.mjs` after each successful `POST /api/tx` | `research/scripts/send-alerts.mjs` (server-side; use a server-side Umami event POST or just rely on `alert-deliveries/` JSON) | Umami cannot instrument server scripts. Use `alert-deliveries/<date>.json` as the source of truth for alert send metrics — no Umami event needed. Noted here to document the deliberate gap. |

---

## 2. Funnel Definitions

### Score-Watch Funnel

Steps in order:

1. **Index page visit** — Umami page view on `/fortune-500`, `/ai-labs`, etc.
2. **Entity page visit** — Umami page view on `/<index>/<slug>`
3. **`score_watch_click`** — Subscribe CTA clicked (`useGumroad = true`) or entity-page fallback button clicked (MISSING EVENT — see above)
4. **Gumroad checkout** — External redirect; measured by absence back to site + `gumroad_click` on other Gumroad products as a proxy; no direct instrumentation possible
5. **`purchase_confirmed`** — `/thank-you?product=score-watch&entity=<slug>` mount fires event

**Conversion math:** `purchase_confirmed {product="score-watch"}` / `score_watch_click` = Score-Watch checkout conversion rate. PRD §4 target: ≥ 2%.

**Expected drop-off ranges (SaaS benchmarks):**

| Step | Expected retention |
|---|---|
| Index page → Entity page | 20–35% (most visitors browse, don't drill down) |
| Entity page → `score_watch_click` | 3–8% (niche intent product) |
| `score_watch_click` → Gumroad checkout start | ~80% (external redirect; low friction) |
| Gumroad checkout start → `purchase_confirmed` | 40–60% (cart abandonment is high for $79 annual, first-time Gumroad users) |

**When drop-off is anomalous:**
- Low `score_watch_click` rate on entity pages: check that `SCORE_WATCH.useGumroad` is `true` and the entity-page CTA is rendering the correct button branch
- High checkout-to-confirmation gap: Gumroad checkout friction; test the checkout URL manually and confirm `?entity=` param is pre-filling correctly
- `purchase_confirmed` fires but welcome email not received within 15 min: debug Cloudflare Worker logs (`wrangler tail`) and KV state (`wrangler kv:key get ...`)

---

### Index Purchase Funnel (US Cities, US States, and existing indexes)

Steps in order:

1. **`/purchase-research` page visit** — Umami page view
2. **Product card click** — `gumroad_click {product: "usCitiesIndex"}` or similar (or `purchase_research_click` once the MISSING EVENT is added)
3. **Gumroad checkout** — External; no direct instrumentation
4. **`purchase_confirmed`** — `/thank-you?product=us-cities-index` (or `us-states-index`) fires event

**Expected drop-off ranges:**

| Step | Expected retention |
|---|---|
| `/purchase-research` visit → product click | 15–30% |
| Product click → `purchase_confirmed` | 35–55% (one-time purchase, lower friction than subscription) |

**When drop-off is anomalous:**
- High visit-to-click rate but low `purchase_confirmed`: Gumroad product may not exist yet (TODO URLs) or report file is not attached. Check `GUMROAD.usCitiesIndex` value in `gumroad.ts`; if it still contains `TODO-us-cities`, the product is not live.
- Zero clicks on US Cities/States cards: confirm `US_CITIES_INDEX.useGumroad` and `US_STATES_INDEX.useGumroad` are `true` (currently `false` in `gumroad.ts:70,79`)

---

### Supporter Funnel

Steps in order:

1. **`/supporters` page visit** — Umami page view
2. **`supporter_click`** — Become a Supporter CTA clicked (`SUPPORTER.useGumroad = true`)
3. **Gumroad checkout** — External
4. **`purchase_confirmed`** — `/thank-you?product=supporter` fires event

**Expected drop-off ranges:**

| Step | Expected retention |
|---|---|
| `/supporters` visit → `supporter_click` | 5–15% (motivation-driven; lower than product pages) |
| `supporter_click` → `purchase_confirmed` | 50–70% (low price, recurring; high intent by arrival) |

**When drop-off is anomalous:**
- `supporter_click` fires but no `purchase_confirmed` in 24h window: Gumroad product may not be live. Confirm `SUPPORTER.useGumroad = true` and the URL is not a TODO placeholder.
- Zero `supporter_click` events: `SUPPORTER.useGumroad` is likely `false` — button routes to `/contact-sales?product=supporter` with no dedicated tracking.

---

### Newsletter Funnel

Steps in order:

1. **Any page visit** — Umami page view (no specific requirement)
2. **Newsletter form interaction** — no event currently tracked for form open/focus
3. **`newsletter_subscribed`** — Form submit success; carries `source` and `backend` properties

**Expected drop-off ranges:**

- Site visit → `newsletter_subscribed`: 1–3% (industry median for inline newsletter CTAs)

**When drop-off is anomalous:**
- `newsletter_subscribe_error {backend: "listmonk"}` volume is elevated: check Listmonk container health (`docker ps` on VPS) and Listmonk API logs
- `newsletter_subscribe_error {backend: "formspree"}`: Listmonk primary is down and formspree fallback is also failing; check both

---

## 3. KPI Dashboard Spec

Weekly monitoring surface. All Umami queries assume the Umami dashboard at the proxied instance; filter by date range = last 7 days unless noted.

| # | Metric name | Definition | Data source | 90-day target (PRD §4) | Alert threshold |
|---|---|---|---|---|---|
| 1 | **Score-Watch conversion rate** | `purchase_confirmed {product="score-watch"}` events / `score_watch_click` events, rolling 30-day | Umami: filter event name = `purchase_confirmed`, property `product = score-watch`; divide by count of `score_watch_click` | ≥ 2% | < 0.5% investigate Gumroad checkout; > 10% confirm not double-firing |
| 2 | **Score-Watch paid subscribers** | Count of KV keys matching prefix `watch:*` with `status = "active"` | `wrangler kv:key list --binding=SCORE_WATCH --prefix="watch:" \| jq '[.[] \| select(.name \| contains(":active"))] \| length'` — or: Gumroad dashboard → Subscribers count for Score-Watch product | 25 paid subscribers by 90 days | < 5 at 60 days: revisit CTA copy and Gumroad checkout flow |
| 3 | **Alert email open rate** | (Emails opened / Emails delivered) per alert send day | Listmonk admin → Campaigns → Transactional → filter template = `score-watch-alert`; read Open Rate column | ≥ 45% | < 25% per send: check subject line deliverability; check SPF/DKIM with mail-tester.com |
| 4 | **Alert email unsubscribe rate** | (Unsubscribes / Emails delivered) per alert send day | Listmonk admin → Campaigns → Transactional; read Unsubscribe Rate column | ≤ 2% per send | > 5% on any single send: review that send's content; confirm alert fired on real score change, not a data artifact |
| 5 | **Index product revenue (combined)** | Sum of Gumroad sales for: `usCitiesIndex`, `usStatesIndex`, `countriesIndex`, `fortune500Index`, `aiLabsIndex`, `roboticsIndex`, `globalCitiesIndex` | Gumroad dashboard → Analytics → Revenue; filter by product group | $975+ from US Cities + US States within 30 days of those products going live | $0 at 14 days post-launch of live URLs: confirm `useGumroad` flags are flipped and Gumroad product files are attached |
| 6 | **Alert fulfillment SLA** | % of alert-send days where `summary.failed = 0` in `research/alert-deliveries/<date>.json` | `cat research/alert-deliveries/<date>.json \| jq .summary` — check all dates in past 7 days | 100% (zero failed sends) | Any `failed > 0`: run `node research/scripts/send-alerts.mjs --retry <date>` immediately |
| 7 | **Integrity check status** | Binary pass/fail from `research/scripts/integrity-check.mjs` run weekly | Run `node research/scripts/integrity-check.mjs` locally; check exit code | Green (pass) every week | **Red = STOP all commercial activity; do not publish score updates until root cause is identified and resolved.** This is the only metric where failure is a halt condition. |
| 8 | **Newsletter subscriber growth** | `newsletter_subscribed` event count, weekly delta | Umami: event name filter = `newsletter_subscribed`; compare week-over-week | No hard target; track trend | Flat or declining for 3+ consecutive weeks: review CTA placement and source property distribution to identify dead surfaces |

---

## 4. Out-of-Band Data Sources

### Gumroad

**What to read:** Sales count, MRR equivalent (annual subscriptions / 12), refund count, churn (cancellations).

**How to read it:**
- Dashboard: [https://app.gumroad.com/dashboard](https://app.gumroad.com/dashboard) → Analytics
- Per-product: Products → click product → Sales tab
- Export: Analytics → Download CSV for date range (use for MRR calculation: sum `price` column / 12 for annual subscriptions)

**Frequency:** Weekly, combined with KPI review.

---

### Listmonk

**What to read:** Alert open rate, unsubscribe rate, bounce rate, subscriber count on Score-Watch list.

**How to read it:**
- Dashboard: `https://lists.compassionbenchmark.com` → login → Campaigns → Transactional
- Subscriber count: Subscribers → filter list = "score-watch"
- Bounce rate: Settings → SMTP → Bounce logs (if configured) or check MTA logs
- CLI query (subscriber count): `curl -u $LISTMONK_USER:$LISTMONK_TOKEN "$LISTMONK_URL/api/lists" | jq '.data.results[] | select(.name=="score-watch") | .subscriber_count'`

**Frequency:** Weekly for open/unsub/bounce; check bounce rate daily for first 2 weeks after launch.

---

### `research/alert-deliveries/<date>.json`

**What to read:** Per-date send count, failure count, skipped-expired count, suppressed count.

**How to read it:**
```bash
# Today's summary
cat research/alert-deliveries/$(date +%Y-%m-%d).json | jq .summary

# Check for any failures in the last 7 days
for f in research/alert-deliveries/*.json; do
  echo "$f: $(jq '.summary | .failed' $f) failed"
done
```

**Frequency:** Daily (60 seconds). Any `failed > 0` triggers manual retry before next pipeline run.

---

### Cloudflare KV (SCORE_WATCH namespace)

**What to read:** Active subscriber count, watch state per subscriber, reverse index per entity.

**How to read it:**
```bash
# Total active watch records
wrangler kv:key list --binding=SCORE_WATCH --prefix="watch:" | jq length

# All watchers for a specific entity
wrangler kv:key get --binding=SCORE_WATCH "index:entity:alphabet"

# Watch state for a specific subscriber + entity
wrangler kv:key get --binding=SCORE_WATCH "watch:alice@example.com:alphabet"

# Recent webhook events (idempotency log)
wrangler kv:key list --binding=SCORE_WATCH --prefix="webhook:" | jq length
```

**Frequency:** Weekly reconciliation (compare KV watch count to Gumroad subscriber count — they should match within ±2 for webhook replay lag).

---

## 5. Independence Audit Metric

### Integrity Check Status

**Script:** `research/scripts/integrity-check.mjs`

**Run command:**
```bash
node research/scripts/integrity-check.mjs
```

**What it checks (per ARCHITECTURE §8.3):**
1. `git log --all -- site/src/data/indexes/` contains only commits from `scanner`, `assessor`, `digest`, or `founder` — no commercial-plane process has ever touched score files
2. `grep -r "watch:\|listmonk\|gumroad" research/scripts/` — commercial-plane identifiers appear only in `send-alerts.mjs`, never in `scanner`, `assessor`, or `digest`
3. Worker source review: no `fetch()` targeting paths that could mutate indexes

**Cadence:** Weekly, Sunday before the Monday pipeline run.

**Failure behavior:** This is the only KPI where failure means STOP — not investigate. If the integrity check fails:
- Halt all commercial operations (do not send alerts, do not process new Gumroad purchases)
- Do not publish score updates from that pipeline run
- Identify and document the root cause before resuming
- Log the incident in git with a commit message referencing the specific invariant that failed

**Dashboard representation:** Single green/red indicator at the top of the weekly KPI review. Green = all invariants passed on last run + exit code 0. Red = any invariant failed or script did not complete.

---

## 6. Experiment Hooks

Run these only after ≥ 30 days of baseline data exist (minimum: stable weekly `score_watch_click` and `purchase_confirmed` counts).

### Experiment 1: Score-Watch CTA copy

**Hypothesis:** Changing entity-page CTA from "Subscribe — $79/yr" to "Get alerted when this score changes — $79/yr" increases `score_watch_click` rate by emphasizing the job-to-be-done over the price.

**Primary metric:** `score_watch_click` / entity-page views (click-through rate)

**Secondary metric:** `purchase_confirmed {product="score-watch"}` / `score_watch_click` (checkout conversion — ensure copy change does not attract unqualified clicks that drop off at payment)

**Expected lift:** 20–40% on CTR; net conversion lift of 10–20%

**Implementation note:** A/B requires client-side rendering variance. Since entity pages are statically exported, this requires a client-side cookie split or Cloudflare Worker A/B at the edge. The current static export makes traditional server-side A/B impractical.

---

### Experiment 2: /purchase-research card layout

**Hypothesis:** Showing the US Cities and US States products in a "New" callout banner above the existing index grid increases `gumroad_click` on those two products by increasing salience.

**Primary metric:** `gumroad_click {product: "usCitiesIndex"}` + `gumroad_click {product: "usStatesIndex"}` click rate from `/purchase-research`

**Expected lift:** 30–50% on the two new cards (novelty effect); monitor for cannibalization of existing index clicks

---

### Experiment 3: Badge widget placement

**Hypothesis:** Moving the `BadgeEmbedWidget` above the Score-Watch CTA block (rather than below it) increases `badge_embed_copy` rate without reducing `score_watch_click` rate.

**Primary metric:** `badge_embed_copy` / entity-page views

**Guardrail metric:** `score_watch_click` / entity-page views must not decrease

**Expected lift:** 15–25% on badge copy rate; net zero or positive on Score-Watch CTR

---

### Experiment 4: Thank-you page cross-sell

**Hypothesis:** Adding a "Also watch another entity" CTA on the `/thank-you` page for `product=score-watch` increases multi-entity subscription rate (measured as a second `purchase_confirmed {product="score-watch"}` within 7 days from the same `entity` session).

**Primary metric:** Second `purchase_confirmed {product="score-watch"}` within 7 days of first, segmented by presence of cross-sell CTA

**Expected lift:** 10–15% of Score-Watch buyers add a second entity within 7 days (based on SaaS upsell benchmarks for low-friction add-ons at confirmation)

---

### Experiment 5: Newsletter placement on entity pages

**Hypothesis:** An inline newsletter signup below the score detail section (before the Score-Watch CTA) on entity pages increases `newsletter_subscribed {source="entity-page"}` without reducing `score_watch_click` rate.

**Primary metric:** `newsletter_subscribed {source="entity-page"}` / entity-page views

**Guardrail metric:** `score_watch_click` / entity-page views (a newsletter capture that cannibalizes subscription intent is net negative)

**Expected lift:** 2–4% newsletter signup rate from entity pages (higher intent than homepage visitors)
