# Revenue Measurement Review — Analytics Assessment
**Date:** 2026-05-28
**Status:** Analysis only — no code modified
**Scope:** Funnel measurability, instrumentation gaps, and improvement candidates for the 4-SKU monetization MVP
**Upstream artifacts read:** METRICS_MONETIZATION_V2.md, PRD_MONETIZATION_V2.md, QA_REPORT_MONETIZATION_V2.md, worker/src/index.ts, docs/LINKEDIN_UTM.md, site/src/data/gumroad.ts, site/src/lib/analytics.ts, site/src/components/ui/Button.tsx, site/src/components/entity/EntityDetail.tsx, site/src/components/entity/EntityNewsletterCapture.tsx, site/src/app/thank-you/ThankYouClient.tsx, site/src/app/layout.tsx

---

## Part A — Current Measurable-Funnel Map

### What the system can and cannot see today

#### What IS measurable right now (evidence-backed)

**Gumroad webhook → Worker KV (confirmed live path)**

The Worker at `worker/src/index.ts` receives Gumroad purchase, cancel, and refund webhooks for three product classes and writes structured records to KV. This is the one authoritative, server-side revenue signal in the stack. It confirms:
- A purchase occurred (sale_id, email hash, product class)
- Which entity was watched (entity_slug extracted from url_params — when present)
- Subscription lifecycle events (cancel, refund)

Evidence: `worker/src/index.ts:251–268` dispatches by product_id; KV writes occur at lines 370, 435, 500. Idempotency is enforced via `webhook:${saleId}` dedup keys (line 235).

**CTA click intent signal (entity pages)**

`EntityDetail.tsx:444–458` fires `score_watch_click` with `{entity_slug, entity_kind, entity_name, fulfillment}` via `Button trackAs=` on both the Gumroad path and the manual-fulfillment fallback. This event reaches Umami (if installed and running) and provides a pre-checkout intent signal.

Evidence: `Button.tsx:47–48` — when `trackAs` is set, `trackEvent(trackAs, {href, ...trackData})` fires on click regardless of external/internal routing.

**Free newsletter opt-in event**

`EntityNewsletterCapture.tsx:104–133` fires `entity_newsletter_subscribed` with `{entity_slug, backend}` on successful opt-in. This is the top-of-funnel list-growth signal.

**`purchase_confirmed` event on /thank-you**

`ThankYouClient.tsx:79–83` fires `purchase_confirmed` with `{product, entity}` read from URL query parameters on page mount.

**LinkedIn attribution (convention-only, not enforced)**

`LINKEDIN_UTM.md` defines a four-parameter UTM convention (`utm_source=linkedin&utm_medium=social&utm_campaign=...&utm_content=...`). Umami preserves UTMs in session records by default. Attribution is measurable for any post that correctly applies the convention — but there is no enforcement mechanism and no verification that posts are actually tagged.

**Admin status endpoint**

`GET /admin/status` (worker/src/index.ts:959–994) returns KV list counts for `watch:*` keys and `ent:*` entitlement keys, providing a point-in-time subscriber count readable by Phil without a Gumroad dashboard visit.

---

#### What CANNOT be seen today (gaps with evidence)

**Gap 1 — The Gumroad redirect wall (critical)**

There is no mechanism to connect a `score_watch_click` event in Umami to a completed purchase in Gumroad. The user leaves the site when they click the CTA. Gumroad fires a webhook to the Worker, but the Worker has no knowledge of which Umami session or UTM source originated that purchase. The only data point that could bridge this gap is the `entity_slug` embedded in the Gumroad checkout URL — but that only identifies the entity, not the traffic source. UTM parameters in the referring URL are not passed to Gumroad webhooks. The conversion rate (CTA clicks that become purchases) is therefore unmeasurable with current infrastructure.

Evidence: `buildScoreWatchUrl` at `gumroad.ts:143–154` appends only `entity`, `index`, and `Entity to Watch` to the Gumroad URL. No `utm_source`, `utm_campaign`, or session token is included. The Gumroad webhook payload (`worker/src/index.ts:286–299`) reads `url_params[entity]` and `url_params[index]` — no UTM fields are extracted or stored.

**Gap 2 — `purchase_confirmed` event depends on Gumroad redirect configuration**

The `/thank-you` page fires `purchase_confirmed` only if Gumroad is configured to redirect buyers to `https://compassionbenchmark.com/thank-you?product=...&entity=...` after checkout. There is no evidence in the codebase that this redirect URL has been configured in Gumroad's product settings. `ThankYouClient.tsx:68–83` reads `product` and `entity` from URL query params — but Gumroad's default redirect behavior passes its own parameters (`sale_id`, `email`, etc.), not custom ones. Without explicit Gumroad product configuration, `purchase_confirmed` will either never fire or will fire with `product="unknown"` and `entity=""`.

Evidence: `gumroad.ts` has no `redirect_url` configuration. `ThankYouClient.tsx:69` reads `params.get("product")` — this will be empty unless Gumroad is configured to pass it.

**Gap 3 — Umami is conditionally loaded; may not be running**

`layout.tsx:62–70` loads the Umami script only when `NODE_ENV === "production"` AND `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set. If the env var is unset in the production build, all `trackEvent()` calls silently no-op (by design in `analytics.ts:31`). There is no evidence in the repo that `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set. No `.env.production` or `.env.example` file was found in site/. Without Umami, the entire client-side event layer — `score_watch_click`, `entity_newsletter_subscribed`, `purchase_confirmed`, and all funnel events — produces zero data.

Evidence: `layout.tsx:63` — double condition on `process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID`. `analytics.ts:31` — `window.umami?.track` uses optional chaining; silently no-ops if window.umami is undefined.

**Gap 4 — No SKU attribution in the webhook record**

The KV dedup record written for each webhook (e.g., `worker/src/index.ts:395–400`) does include `product: "watcher"`, but the primary WatchRecord written to `SCORE_WATCH` KV at line 369 has no `sku` or `price` field. The ENTITLEMENTS record shape (`EntitlementRecord` at line 125) has no `amount_usd` for Watcher or Briefing Archive (only IndexSnapshot has it, line 122). This means ARR calculation from KV requires multiplying subscriber count by the known price — doable, but fragile if prices change. The webhook dedup key captures the product type but the dedup keys expire after 30 days (`WEBHOOK_DEDUP_TTL`, line 76), so the audit trail disappears.

Evidence: `WatchRecord` interface (lines 84–96) — no price field. `BriefingArchiveEntitlement` (lines 109–116) — no amount_usd. Dedup key expiry at line 237.

**Gap 5 — /newsletter/subscribe Worker route does not exist**

`EntityNewsletterCapture.tsx:37` POSTs to `${WORKER_URL}/newsletter/subscribe`, but this route is not implemented in `worker/src/index.ts`. The Worker's route table (lines 149–192) has no handler for `/newsletter/subscribe`. The component falls back to Listmonk directly (line 61) or Formspree (line 75), but the entity-slug tagging that makes the `entity_newsletter_subscribed` event useful — knowing which entity page drove the opt-in — depends on the Worker path succeeding. If the Worker returns a non-2xx response, the entity-slug is still captured in the client event, but the Listmonk subscriber record lacks the `entity_slug` attribute, breaking the free-opt-in → Watcher upgrade funnel linkage in Listmonk segmentation.

Evidence: `worker/src/index.ts` route table — no `/newsletter/subscribe` handler. `EntityNewsletterCapture.tsx:37`.

**Gap 6 — Multiple SKUs have broken Gumroad URLs (pre-launch state)**

Five of eight Gumroad URLs in `gumroad.ts` are `TODO` placeholders (`scoreWatch`, `observer`, `briefingArchive`, `usCitiesIndex`, `usStatesIndex`). `SCORE_WATCH.useGumroad` is `false` at `gumroad.ts:68`. The `gumroad_click` event that `Button.tsx:50` fires on external Gumroad link clicks will not fire for any CTA that routes to a TODO URL or routes to `/contact-sales` (internal link — `Button.tsx:72–78` only tracks on `external=true`). So for every live Index Snapshot product (Countries, Fortune 500, AI Labs, Robotics, Global Cities), `gumroad_click` events should be firing — but for the entire Watcher/Observer/Briefing Archive revenue tier, no checkout click events exist yet.

Evidence: `gumroad.ts:14,19,24,31,38,68`. `Button.tsx:44` — click tracking only in the `if (href && external)` branch.

---

### Measurable funnel map summary

```
STEP                           MEASURABLE?   SIGNAL SOURCE          EVIDENCE
─────────────────────────────────────────────────────────────────────────────
LinkedIn post click            YES           Umami UTM session      LINKEDIN_UTM.md + layout.tsx:67
                                             (if Umami is running)
Entity page view               YES           Umami pageview         layout.tsx:67 (conditional)
Newsletter opt-in click        YES           entity_newsletter_     EntityNewsletterCapture.tsx:104
                                             subscribed event
Index Snapshot CTA click       YES           gumroad_click event    Button.tsx:50 (external=true)
                                             (5 live products)
Score-Watch CTA click          YES           score_watch_click      EntityDetail.tsx:448
                                             (manual-fulfillment
                                             path fires the event)
──── ATTRIBUTION WALL: user leaves site for Gumroad ────────────────────────
Gumroad checkout start         NO            (nothing)              No bridge mechanism
Gumroad checkout completion    PARTIAL       Worker webhook →       worker/src/index.ts:255
                                             KV (product + entity
                                             slug, no UTM source)
purchase_confirmed client      UNRELIABLE    ThankYouClient.tsx:79  Depends on Gumroad
event                                        (URL param-dependent)  redirect config
Subscription cancellation      YES           Worker webhook → KV    worker/src/index.ts:321
Subscription refund            YES           Worker webhook → KV    worker/src/index.ts:304
Active subscriber count        YES           /admin/status          worker/src/index.ts:959
ARR                            MANUAL        Gumroad dashboard      No automated signal
```

---

## Part B — Top Instrumentation Gaps

Ranked by revenue-optimization impact:

1. **Attribution wall at the Gumroad redirect**: clicks and purchases cannot be joined. The team cannot measure conversion rate, channel-level conversion, or SKU-level conversion. Every optimization hypothesis (price test, CTA copy, placement) is untestable without this.

2. **`purchase_confirmed` is unverified and URL-param-dependent**: the one client-side purchase signal fires only if Gumroad redirect is configured and passes the right parameters. If this is not set up, the entire Umami purchase funnel is dark.

3. **Umami may not be running in production**: if `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is not set, the entire event layer is silent. This cannot be confirmed from the codebase alone.

4. **No SKU attribution in the webhook revenue record**: the Worker knows a purchase occurred but does not record price/revenue amount for subscription SKUs, making ARR automation impossible without Gumroad CSV exports.

5. **`/newsletter/subscribe` Worker route missing**: entity-slug tagging of opt-ins is unreliable, breaking the free-opt-in → upgrade funnel linkage.

---

## Part C — Candidate Instrumentation Improvements

---

### Candidate 1 — Embed UTM source in Gumroad checkout URL

**Type:** Fix

**Problem:** The Gumroad checkout URL built by `buildScoreWatchUrl` (`gumroad.ts:143–154`) only passes `entity`, `index`, and `Entity to Watch`. The Worker webhook handler (`worker/src/index.ts:286–299`) reads those three fields but discards all others. UTM source from the originating session is never passed to Gumroad and never recorded in KV. The result: the team cannot tell whether a Watcher purchase came from LinkedIn, organic search, or a direct visit. Channel ROI is completely unmeasurable.

**Proposed change:** Extend `buildScoreWatchUrl` (and equivalent URL builders for Observer and Briefing Archive) to append `utm_source`, `utm_campaign`, and `utm_content` to the Gumroad URL when those values are readable from the current page's URL or session. Gumroad passes all URL params to the webhook via `url_params[key]`. Extend the Worker's `handleWatcherWebhook` to extract and store `utm_source`, `utm_campaign`, and `utm_content` in the KV WatchRecord and ENTITLEMENTS record. This creates a `utm_source` field on every purchase record, enabling channel-level conversion analysis from KV data alone, without a data warehouse.

**Event/metric created:** `WatchRecord.utm_source` (KV field) — readable via `/admin/status` extension or direct KV export. Enables: purchases by channel, conversion rate by channel (joining with Umami `score_watch_click` UTM session counts).

**Expected revenue benefit:** Unlocks channel ROI measurement for LinkedIn campaigns. If LinkedIn converts at 3x the rate of organic, the posting cadence can be doubled. If organic converts at 2x, SEO investment is justified. Without this, the team cannot make a single data-backed channel allocation decision.

**Independence-policy check:** PASS. UTM source is traffic metadata about the referring post, not about the entity being watched. No entity identity is affected. UTM values never enter any public surface.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **16** |

---

### Candidate 2 — Verify and enforce Gumroad post-purchase redirect with purchase parameters

**Type:** Fix

**Problem:** `ThankYouClient.tsx:69` reads `product` and `entity` from URL query params to fire `purchase_confirmed`. But Gumroad's default redirect after checkout passes its own parameters (sale_id, email) — not custom `product=` or `entity=` params. There is no configuration in the codebase (no redirect URL template, no `gumroad.ts` redirect field) confirming this redirect is set up. If it is not, `purchase_confirmed` fires with `product="unknown"` and `entity=""` — or does not fire at all because the params are empty (line 78: `if (!product && !entity) return` prevents the event from firing on empty params). The `purchase_confirmed` event is the only client-side purchase confirmation signal and the intended anchor for all funnel conversion calculations in METRICS_MONETIZATION_V2.md §4.

**Proposed change:** Two parts: (a) Document and confirm in `gumroad.ts` that Gumroad products are configured with a redirect URL of `https://compassionbenchmark.com/thank-you?product={sku}&entity={slug}`. Add a code comment or constant for this expected redirect URL template so it is not implicit. (b) Modify `ThankYouClient.tsx` to also fire `purchase_confirmed` when `sale_id` is present in the URL (Gumroad always passes this) even if custom params are absent, recording `{product: "unknown", sale_id: <value>}`. This creates a fallback signal that proves a purchase happened even if the product routing is misconfigured.

**Event/metric created:** `purchase_confirmed` with reliable `sale_id` field — creates a cross-reference between Gumroad sale_id (known from webhook) and the client-side session, enabling UTM attribution join if both events carry the same sale_id.

**Expected revenue benefit:** Without a working `purchase_confirmed`, the entire Umami-side conversion funnel (Funnels 1–5 in METRICS_MONETIZATION_V2.md §4) is dark. Fixing this makes conversion rate measurable for every SKU. Converting from 0% measurability to even rough conversion rates enables the Experiment 1 price test (§6) to run.

**Independence-policy check:** PASS. `sale_id` is a transaction identifier with no entity-scoring implications. No public surface.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **16** |

---

### Candidate 3 — Add purchase event logging to Worker with price/revenue amount for subscription SKUs

**Type:** Improvement

**Problem:** The `WatchRecord` interface (`worker/src/index.ts:84–96`) has no `price` or `sku` field. The `BriefingArchiveEntitlement` shape (`lines 109–116`) has no `amount_usd`. The only KV record that captures revenue amount is `IndexSnapshotEntitlement` (`line 122`). This means: (a) ARR cannot be calculated from KV data — it requires a manual Gumroad CSV export; (b) the dedup record (which does include `product`) expires after 30 days (`WEBHOOK_DEDUP_TTL`, line 76), erasing the only time-stamped purchase log; (c) there is no way to detect if Gumroad's `price` field in the webhook differs from the expected price (e.g., a discount code was applied), which would make the ARR calculation wrong.

**Proposed change:** (a) Add `price_usd: number` to `WatchRecord` and `BriefingArchiveEntitlement`, populated from `form.get("price")` in the webhook handler (same as IndexSnapshot, line 489). (b) Extend the dedup record to never expire (remove `expirationTtl`) or extend TTL to 2 years — the dedup record is the only append-only purchase log in the system. (c) Add a `gumroad_webhook_purchase` log key pattern (e.g., `purchase_log:{date}:{saleId}`) in a separate KV namespace or as a list in ENTITLEMENTS that accumulates without overwriting, enabling a weekly revenue sum query without Gumroad CSV.

**Event/metric created:** `WatchRecord.price_usd` and `BriefingArchiveEntitlement.price_usd` — enables KV-native ARR calculation: `SUM(active watch records where status=active) * price_usd_per_record`. The non-expiring purchase log enables weekly revenue queries from KV without Gumroad dashboard access.

**Expected revenue benefit:** Enables the weekly KPI dashboard (METRICS_MONETIZATION_V2.md §8) to be populated from KV data rather than manual Gumroad CSV exports. Reduces dashboard update time from 30–45 minutes to under 5 minutes. Enables detection of discount-code usage that erodes realized ARR vs. projected ARR.

**Independence-policy check:** PASS. Price is commercial transaction data, not research data. No entity score is involved. KV is internal-only.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **12** |

---

### Candidate 4 — Implement /newsletter/subscribe Worker route with entity-slug tagging

**Type:** Fix

**Problem:** `EntityNewsletterCapture.tsx:37` calls `POST ${WORKER_URL}/newsletter/subscribe` with `{email, entity_slug, source: "entity-page"}`. This route does not exist in `worker/src/index.ts` — the route table handles only `/gumroad/webhook`, `/unsubscribe`, `/badge/*`, `/api/v1/subscribers`, `/admin/status`, and the three Wave 3 entitlement routes. The Worker returns 404. The component silently falls back to direct Listmonk or Formspree submission, which does not pass `entity_slug`. The result: Listmonk subscribers from entity pages have no entity tag, so the upgrade email sequence cannot be entity-scoped ("You were watching Apple — subscribe to Score-Watch alerts for Apple"), and the `newsletter_subscribed` → `score_watch_click` funnel (Funnel 2, METRICS_MONETIZATION_V2.md §4) cannot be segmented by entity.

**Proposed change:** Add `POST /newsletter/subscribe` to the Worker route table. Handler: validate email, forward to Listmonk subscriber create/update API with `entity_slug` stored in the subscriber `attribs` object (same pattern as `syncListmonk` at line 1209). Write a KV record `newsub:{email}:{entitySlug}` with TTL 90 days for upgrade funnel tracking. Return 200 on success. The implementation mirrors the existing Listmonk integration already in the Worker — it is additive, not a new pattern.

**Event/metric created:** Listmonk subscriber attribute `entity_slug` — enables segmented upgrade email campaigns ("You subscribed from the Apple page — alerts available for $79/yr"). KV record `newsub:*` — enables counting of entity-page opt-ins by entity for content prioritization.

**Expected revenue benefit:** The upgrade email sequence (Funnel 2) is the primary path from free opt-in to Watcher revenue. Without entity-slug tagging, upgrade emails are generic ("Subscribe to Score-Watch") rather than specific ("Get alerts when Apple's score changes — $79/yr"). Personalized upgrade emails are expected to convert at 2–3x the rate of generic ones based on standard email marketing benchmarks. At the 90-day target of 25 Watcher subscribers, this funnel matters immediately.

**Independence-policy check:** PASS. `entity_slug` in a subscriber attribute reflects the page the visitor came from, not any research finding. It is used only for email personalization. The rule is that entity popularity data from subscriber counts is never shared publicly or used to influence research — this route does not violate that rule because it operates on individual subscriber records, not aggregate entity popularity.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **11** |

---

### Candidate 5 — Add Umami environment variable verification step to deployment checklist

**Type:** Fix

**Problem:** `layout.tsx:62–63` only loads the Umami script when both `NODE_ENV === "production"` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are truthy. `analytics.ts:31` silently no-ops if `window.umami` is undefined. There is no `.env.example` in `site/` and no entry in `DEPLOYMENT.md` confirming this env var is set in the VPS build. If `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is absent from the Docker build environment, all client-side analytics are silently disabled — `score_watch_click`, `entity_newsletter_subscribed`, `purchase_confirmed`, and all funnel events produce zero data. The team would have no visibility into this failure because the UI behavior is identical whether Umami is running or blocked.

**Proposed change:** (a) Add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to a `.env.example` file in `site/` with a placeholder value and comment. (b) Add a startup check in `analytics.ts` that logs a console warning (not error) in production when `window.umami` is not defined after page load (e.g., in a `useEffect` or via a `setTimeout` check 3 seconds after page load). (c) Add a manual verification step to `DEPLOYMENT.md`: "Verify Umami is receiving events by opening the Umami dashboard and confirming pageview count increases after a page load on the live site." This is not a code change — it is a deployment discipline fix.

**Event/metric created:** Not a new event — this ensures existing events reach Umami at all. It is a precondition for all other measurement.

**Expected revenue benefit:** If Umami is currently dark in production, fixing it immediately unlocks all existing instrumentation. Every other measurement initiative in this document depends on Umami running. This is the precondition fix.

**Independence-policy check:** PASS. Umami is cookieless, self-hosted, and already approved in METRICS_MONETIZATION_V2.md §7. No new privacy surface.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 3 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **12** |

---

## Summary Table

| # | Title | Type | Priority Score |
|---|---|---|---|
| 1 | Embed UTM source in Gumroad checkout URL | Fix | 16 |
| 2 | Verify and enforce Gumroad post-purchase redirect | Fix | 16 |
| 3 | Add revenue amount to Worker KV records | Improvement | 12 |
| 4 | Implement /newsletter/subscribe Worker route | Fix | 11 |
| 5 | Verify Umami environment variable in deployment | Fix | 12 |

Candidates 1 and 2 tie on priority score and should be treated as a single release: Candidate 2 (redirect setup) must be completed before Candidate 1 (UTM in checkout URL) produces any joined signal, because without a working /thank-you conversion event there is no purchase-side anchor for the attribution join. Candidate 5 is a precondition for all others — it should be verified first.

---

*Analytics agent | 2026-05-28 | Analysis only. No code modified. Downstream recipients: backend-engineer (Candidates 1, 3, 4), Phil/ops (Candidates 2, 5), product-manager (gap context), coordinator (handoff sequencing).*
