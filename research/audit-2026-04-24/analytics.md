# Analytics Audit — 2026-04-24

## Top 3 Critical Findings

1. **Score-Watch CTA is untracked in its primary state** — `SCORE_WATCH.useGumroad` is `false` (`site/src/data/gumroad.ts:30`), so the "Subscribe" button on every entity detail page routes to `/contact-sales` as an internal Next.js `<Link>`, not an external `<Button>`. Internal link clicks are not tracked by Umami or the `trackEvent` helper. The `score_watch_click` event at `EntityDetail.tsx:300` only fires when `useGumroad` is `true`, which it is not. The result: the most prominent CTA on the site produces zero conversion signal in Umami today.

2. **No scroll depth, time-on-page, or outbound source-link tracking on `/updates/[date]`** — The daily briefing page contains numbered evidence URLs rendered as plain `<a>` anchors (`DailyBriefing.tsx:487`). None carry `trackAs`, `data-umami-event`, or any click handler. There is no scroll-depth observer or engagement timer anywhere in the codebase. For a page that is the primary editorial output and the intended LinkedIn landing target, the only signal available is the raw pageview. Whether readers consume the content, click to sources, or bounce at the hero is invisible.

3. **Gumroad purchase attribution is permanently broken for external buyers** — When a user clicks a `gumroad_click` event and completes a Gumroad purchase, the purchase confirmation happens entirely within Gumroad's domain. There is no webhook, no post-purchase redirect with query params, and no Gumroad ping configured in the repo. The `gumroad_click` event records intent, but actual conversion — money changing hands — cannot be connected back to a referring page, UTM session, or newsletter source. The attribution chain ends at the click.

---

## Funnel Readiness Scoreboard

| Funnel | Top (visit) | Middle (engage) | Bottom (convert) | Total |
|---|---|---|---|---|
| Score-Watch | 1 | 0 | 0 | 1/3 |
| Research assets | 1 | 1 | 0 | 2/3 |
| Contact-sales | 1 | 1 | 1 | 3/3 |
| Certified assessments | 1 | 0 | 0 | 1/3 |
| Newsletter | 1 | 1 | 1 | 3/3 |

Scoring key: Top = pageview on the funnel entry page (Umami default); Middle = click or engagement event fired; Bottom = confirmed conversion event fired.

---

## Detailed Findings

### 1. Event Instrumentation Coverage

**Implemented — verified by file:line**

| Event name | File:line | Trigger condition |
|---|---|---|
| `gumroad_click` | `site/src/components/ui/Button.tsx:50` | Click on any external `<Button>` whose `href` resolves to a key in `GUMROAD` product map |
| `newsletter_subscribed` | `site/src/components/ui/NewsletterSignup.tsx:94` | Successful Listmonk 2xx response |
| `newsletter_subscribed` | `site/src/components/ui/NewsletterSignup.tsx:108` | Successful Formspree 2xx response |
| `newsletter_subscribe_error` | `site/src/components/ui/NewsletterSignup.tsx:99` | Listmonk failure, falls through to Formspree |
| `newsletter_subscribe_error` | `site/src/components/ui/NewsletterSignup.tsx:111` | Formspree non-2xx |
| `newsletter_subscribe_error` | `site/src/components/ui/NewsletterSignup.tsx:115` | Formspree network error |
| `contact_sales_submitted` | `site/src/components/purchase/SalesInquiryForm.tsx:88` | Formspree POST returns `ok`, with `service_interest` property |
| `score_watch_signup` | `site/src/components/purchase/SalesInquiryForm.tsx:98` | `contact_sales_submitted` fires AND `service === "score-watch"` |
| `contact_sales_error` | `site/src/components/purchase/SalesInquiryForm.tsx:106` | Formspree non-ok response |
| `contact_sales_error` | `site/src/components/purchase/SalesInquiryForm.tsx:112` | Fetch network exception |
| `updates_entity_click` | `site/src/components/updates/TrackedEntityLink.tsx:33` | Click on any entity link in scoreChanges, confirmations, recentAssessments, or sectorAlert sections; carries `slug`, `index`, `source` properties |
| `score_watch_click` | `site/src/components/entity/EntityDetail.tsx:300` | Click on Gumroad-routed Subscribe button; ONLY fires when `SCORE_WATCH.useGumroad === true` |

**Aspirational — defined in docs but not in code**

| Event name | Status | Evidence |
|---|---|---|
| `score_watch_click` (entity pages) | Wired but dead — `useGumroad` is `false` | `gumroad.ts:30` |
| Scroll depth on `/updates/[date]` | Not implemented anywhere | No observer in DailyBriefing.tsx or page.tsx |
| Time-on-page for daily briefing | Not implemented | No timer instrumentation in codebase |
| Outbound source-link clicks | Not implemented | Evidence `<a>` tags at `DailyBriefing.tsx:487` are bare anchors |
| CTA clicks to Score-Watch from daily briefing | Not implemented | Buttons at `DailyBriefing.tsx:513-514` and `779-780` are internal `<Link>` components, no tracking |

**Pageviews (Umami default)**

Umami script is loaded globally at `site/src/app/layout.tsx:63` from `/u/script.js` with `data-host-url="/u"`. All page navigations produce automatic pageview events. UTM parameters are captured by Umami in the session referrer record without additional instrumentation.

---

### 2. Per-Funnel Gaps

**Score-Watch (1/3)**

- Top: `/score-watch` pageview captured by Umami default.
- Middle: MISSING. The Subscribe CTA on entity pages (`EntityDetail.tsx:310-315`) is an internal Next.js `<Link>` (not a `<Button external>`), so no click event fires. The `/score-watch` page CTAs at `score-watch/page.tsx:45` and `score-watch/page.tsx:229` are also internal links — no tracking. The only middle-funnel signal would come from the contact-sales page load, but that is not specifically tagged.
- Bottom: `score_watch_signup` fires only after a Formspree submission completes successfully — this IS implemented at `SalesInquiryForm.tsx:98`. However, the event never fires in the current flow because users must navigate to `/contact-sales` via untracked internal links. The bottom event exists; the path to it is dark.
- Minimum fix: Add `trackAs="score_watch_cta_click"` to the internal Score-Watch Subscribe buttons (requires converting them to `<Button>` with an `onClick` handler, since `trackAs` only fires on external links currently), or add a `useEffect` to the contact-sales page that fires a `score_watch_page_view` event when `?product=score-watch` is present in the URL.

**Research Assets (2/3)**

- Top: `/purchase-research` pageview captured.
- Middle: `gumroad_click` fires with `product` property when a research-asset Gumroad button is clicked (`Button.tsx:50`). Implemented and working for all five products in `gumroad.ts`.
- Bottom: MISSING. No post-purchase signal exists. Gumroad does not call back to the site. Actual purchase is invisible.
- Minimum fix: Configure a Gumroad webhook to POST to a lightweight endpoint (or Formspree), then fire a `gumroad_purchase_confirmed` event. Alternatively, use Gumroad's "receipt URL" redirect feature to return the buyer to a `/thank-you?product={key}` page that fires the event client-side.

**Contact-Sales (3/3)**

- Top: `/contact-sales` pageview captured.
- Middle: The form itself is the engagement surface; pre-population from URL params is the mid-funnel signal.
- Bottom: `contact_sales_submitted` fires at `SalesInquiryForm.tsx:88` with `service_interest`. This is the best-instrumented funnel on the site.
- No gaps.

**Certified Assessments (1/3)**

- Top: `/certified-assessments` pageview captured.
- Middle: MISSING. The "Begin a certified assessment inquiry" CTA at `certified-assessments/page.tsx:269` routes to `/contact-sales` as an internal link. No event.
- Bottom: `contact_sales_submitted` with `service_interest: "assessment"` fires when a user completes the form, but because the mid-funnel click is untracked, drop-off cannot be located.
- Minimum fix: Add `trackAs="certified_assessment_cta_click"` to the CTA button, or emit a `contact_sales_page_view` event on the contact-sales page when `service=assessment` is pre-selected.

**Newsletter (3/3)**

- Top: Newsletter signup components are embedded on multiple pages; pageviews of host pages are captured.
- Middle: Form interaction is implicit (no `newsletter_form_focused` event), but the submit attempt is covered.
- Bottom: `newsletter_subscribed` fires on success via both backends at `NewsletterSignup.tsx:94` and `NewsletterSignup.tsx:108`. The `source` and `variant` properties let you distinguish which page and layout converted.
- Note: If Listmonk env vars are not set on the VPS (founder noted pending setup), the backend falls through to Formspree silently — `newsletter_subscribed` still fires with `backend: "formspree"`. The event is reliable regardless of backend state.

---

### 3. Attribution

**UTM capture:** Umami captures all four standard UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) in the session record automatically. No additional instrumentation is needed to see traffic volumes by UTM dimension in the Umami dashboard.

**Gumroad purchase attribution:** There is no mechanism to carry UTM context through a Gumroad checkout. When a visitor from `utm_campaign=sector-trend` clicks a `gumroad_click` and completes a purchase, the purchase happens on `compassionbenchmark.gumroad.com` with no return signal. The `gumroad_click` event carries `product` and `href` properties, which lets you see that a given UTM session resulted in a click, but not in a confirmed purchase. Attribution ends at click.

**Minimum instrumentation to close attribution:**
1. Use Gumroad's "redirect after purchase" setting to send buyers to `compassionbenchmark.com/thank-you?product={key}&source={utm_campaign}`. Pass the UTM value in the Gumroad checkout URL as a custom field or as part of the redirect URL.
2. On the `/thank-you` page, fire `gumroad_purchase_confirmed` with `product` and any query params that survived.
3. This requires a small amount of state-passing — the UTM value must be appended to the Gumroad URL at click time. The `Button.tsx` click handler already has access to the href and could append `?utm_passthrough={utm_campaign}` from `window.location.search` before navigating.

---

### 4. Daily-Update Page Analytics

The `/updates/[date]` page (`site/src/app/updates/[date]/page.tsx`) and the `DailyBriefing` component (`site/src/components/updates/DailyBriefing.tsx`) have the following instrumentation state:

**Implemented:**
- Pageview (Umami default) — records that `/updates/2026-04-24` was visited.
- `updates_entity_click` — fires when any entity name link is clicked within scoreChanges, confirmations, recentAssessments, or sectorAlert sections (`TrackedEntityLink.tsx:33`). Carries `slug`, `index`, `source` properties. This is the only engagement signal on the page.
- `newsletter_subscribed` — the inline `NewsletterSignup` components at `DailyBriefing.tsx:422` (`source="updates-score-movements"`) and `DailyBriefing.tsx:620` (`source="updates-highlights"`) fire the standard event on success.

**Not implemented:**
- Scroll depth. No `IntersectionObserver` or scroll percentage tracker exists anywhere in the codebase. Whether a reader reaches the Sector Intelligence or Emerging Risks sections is unknown.
- Time-on-page. No engagement timer. Whether the page holds attention for 2 minutes or 10 is not measurable from Umami data.
- Outbound source link clicks. Evidence links in sectorAlerts (`DailyBriefing.tsx:487`) are plain `<a target="_blank">` anchors. Clicking them produces no event.
- Score-Watch CTA clicks from the daily briefing. The two Callout CTAs at `DailyBriefing.tsx:513` and `DailyBriefing.tsx:779` link to `/purchase-research` and `/certified-assessments` as plain internal `<Button>` components — no tracking. Score-Watch is not CTA'd from the daily briefing at all; the only path is entity pages.

The gap is significant. The `/updates` page is the primary content product and the intended LinkedIn campaign landing page. The only conversion signal currently available is `updates_entity_click` (did the reader click into an entity?) and `newsletter_subscribed` with the `updates-*` source. No reading-depth or CTA-click signal exists.

---

### 5. Dashboard Feasibility Today

**What Umami can surface today from existing instrumentation:**

- Daily and weekly pageview counts by URL (DAU/MAU approximation via unique sessions)
- Top landing pages and referrers (with UTM breakdown for utm_source, utm_medium, utm_campaign, utm_content)
- `newsletter_subscribed` count, rate over time, and breakdown by `source` and `variant`
- `contact_sales_submitted` count and breakdown by `service_interest`
- `score_watch_signup` count (a subset of contact_sales_submitted)
- `gumroad_click` count and breakdown by `product`
- `updates_entity_click` count and breakdown by `slug`, `index`, and `source`

**What cannot be derived from Umami data today:**

- Actual Gumroad purchase count or revenue — click ≠ purchase
- Conversion rate from Gumroad click to confirmed purchase
- Score-Watch subscription count (the event exists but the primary path to it is untracked)
- Newsletter open rate or reply rate (lives in Listmonk/Formspree, not Umami)
- Scroll depth or time-on-page for any page
- Certified assessment inquiry rate (masked inside generic `contact_sales_submitted`)
- Retention or return visit rate at user level (Umami tracks sessions, not authenticated users)

**Verdict:** A partial dashboard is buildable today. The newsletter and contact-sales funnels are fully visible. Research asset click-through is visible. The core product KPI — did reading the daily briefing convert a reader into a subscriber or buyer — is only weakly answerable: you can see if a `newsletter_subscribed` event fired in the same session as an `/updates/[date]` pageview, but only by joining sessions in Umami's data, which requires the Umami database query interface, not the default dashboard. Out of the box, no pre-built Umami view shows this joined funnel.

---

### 6. LinkedIn Campaign Measurement

**UTM parameter capture:** Umami captures all four standard params. The scheme used in `docs/LINKEDIN_AI_GOVERNANCE_BIFURCATION.md` (`utm_source=linkedin&utm_medium=social&utm_campaign=sector-trend&utm_content=ai-governance-bifurcation`) will appear in Umami's "Sources" report with full dimension breakdown. No additional work is needed.

**UTM convention consistency:** Two UTM documents exist in the repo.

- `docs/LINKEDIN_UTM.md` defines the canonical convention. `utm_campaign` values are: `daily-briefing`, `weekly-briefing`, `entity-spotlight`, `sector-trend`, `methodology`, `score-watch-launch`.
- `docs/LINKEDIN_AI_GOVERNANCE_BIFURCATION.md` uses `utm_campaign=sector-trend`, which matches the convention.

No divergence between documents was found. The convention is internally consistent.

**Risk:** The convention is documented but not enforced. There is no validation layer — a post published with `utm_campaign=trending` or `utm_campaign=AI-governance` would silently create a new campaign dimension in Umami and split historical comparison. The `docs/LINKEDIN_UTM.md` anti-patterns section (`docs/LINKEDIN_UTM.md:77-83`) documents this risk but does not prevent it.

**Umami's UTM surface:** Umami surfaces UTM params in its Sources report. All four parameters are available as filter dimensions. Campaign-level funnels (visits with `utm_campaign=sector-trend` → `newsletter_subscribed`) require filtering in the Umami event log, not the summary dashboard. This is possible but manual.

---

## Minimum Instrumentation MVP

The smallest set of changes that closes every funnel gap and makes attribution work:

1. **Track Score-Watch CTA clicks on entity pages (Score-Watch funnel, middle).** In `EntityDetail.tsx`, the internal-link Subscribe button (active when `useGumroad === false`) should fire a `score_watch_cta_click` event. Add an `onClick` handler that calls `trackEvent("score_watch_cta_click", { entity_slug, entity_kind, entity_name })` before routing. One-line change per button.

2. **Track certified-assessment and research CTA clicks from the daily briefing (Certified Assessments, middle).** The two `<Callout>` blocks in `DailyBriefing.tsx` at lines 513 and 779 contain internal `<Button>` links to `/purchase-research` and `/certified-assessments`. Add `onClick` handlers on each that fire `daily_briefing_cta_click` with a `destination` property. This gives the daily-update → intent signal that is currently missing.

3. **Pass UTM context into Gumroad URLs and configure post-purchase redirect (Research Assets, bottom / Score-Watch, bottom).** In `Button.tsx`, when the click handler resolves a Gumroad product, read `window.location.search` for `utm_campaign` and `utm_content` and append them to the `href` before the browser navigates. Configure Gumroad to redirect to `compassionbenchmark.com/thank-you?product={key}`. On the thank-you page, fire `gumroad_purchase_confirmed` with `product` and the passthrough UTM values. This closes the attribution gap for all paid research products.

4. **Add scroll-depth tracking to `/updates/[date]` (Daily update engagement).** In `DailyBriefing.tsx`, add a client-side `IntersectionObserver` that fires `briefing_scroll_depth` events at 25%, 50%, 75%, and 100% of page content (use the section landmarks already present). Fire once per depth threshold per session. This converts the briefing page from a single pageview signal into an engagement curve.

5. **Add outbound source-link click tracking in sectorAlerts (Daily update engagement).** In `DailyBriefing.tsx` at the evidence source `<a>` anchors (line 487), replace with a tracked wrapper that fires `briefing_source_click` with `domain` and `alert_sector` properties. This is the signal that readers are verifying evidence, which is the product's core credibility claim and the strongest leading indicator of trust.

---

## Dashboard Spec — Top 10 Weekly Metrics

| # | Metric | Definition | Data Source | Cadence |
|---|---|---|---|---|
| 1 | Weekly unique sessions | Count of distinct Umami sessions in 7-day window | Umami sessions report | Weekly |
| 2 | Newsletter conversion rate | `newsletter_subscribed` events / sessions on pages containing a signup form | Umami events ÷ pageviews | Weekly |
| 3 | Newsletter absolute growth | Net new `newsletter_subscribed` events in 7 days (subtract unsubscribes from Listmonk) | Umami events + Listmonk unsubscribe count | Weekly |
| 4 | Gumroad click rate | `gumroad_click` events / total sessions | Umami events ÷ sessions | Weekly |
| 5 | Research asset click breakdown | `gumroad_click` count grouped by `product` property | Umami event property filter | Weekly |
| 6 | Contact-sales submission rate | `contact_sales_submitted` events / sessions on `/contact-sales` | Umami events ÷ pageview on path | Weekly |
| 7 | Score-Watch signup count | `score_watch_signup` events | Umami event filter | Weekly |
| 8 | Daily briefing entity click rate | `updates_entity_click` events / sessions landing on `/updates/*` | Umami events ÷ pageviews on path pattern | Weekly |
| 9 | LinkedIn campaign sessions | Sessions where `utm_source=linkedin`, broken down by `utm_campaign` | Umami Sources report filtered by utm_source | Weekly |
| 10 | Top-converting briefing source | `newsletter_subscribed` events with `source` containing "updates-", ranked by count | Umami event property filter on `source` | Weekly |
