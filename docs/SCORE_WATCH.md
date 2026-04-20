# Score-Watch Alert — Product Spec & Operations

## What it is

**Score-Watch Alert** is a per-entity email subscription. When overnight research moves a tracked entity's Compassion Benchmark composite score (or crosses a band boundary), the subscriber gets an email the next morning containing:

- Composite delta and new composite score
- Band change (if any), e.g. `Functional → Developing`
- Headline evidence summary
- Link to the full daily briefing entry for the entity
- Link to the entity detail page

## Pricing

- **$79 per entity per year**
- Scoped to a single entity (subscribers can buy multiple)
- Annual billing, cancel anytime, prorated refund on unused portion

## Surfaces

- `/score-watch` — product landing page (features, eligible indexes, buyers, FAQ)
- `/<entity-kind>/<slug>` — every entity detail page renders a prominent "Subscribe — $79/yr" card
- `/contact-sales?product=score-watch` — manual fulfillment form (MVP pathway)
- Footer nav: "Score-Watch Alerts" under Services

## MVP fulfillment (current state — 2026-04-18)

`SCORE_WATCH.useGumroad === false` in `site/src/data/gumroad.ts`.

1. Visitor clicks "Subscribe — $79/yr" on `/score-watch` or any entity detail page
2. Button routes to `/contact-sales?product=score-watch&entity={slug}&kind={kind}&name={name}#inquiry`
3. `SalesInquiryForm` prefills:
   - `service` = `score-watch`
   - `message` = `"Score-Watch Alert subscription for: {entityName} ({kind}/{slug}) — $79/yr..."`
4. Visitor submits the Formspree form
5. Umami fires two events:
   - `contact_sales_submitted` `{service_interest: "score-watch", has_organization}`
   - `score_watch_signup` `{entity_slug, entity_kind, entity_name}`
6. Operator receives email, manually invoices via Stripe/Gumroad/email payment link
7. Operator adds entity → subscriber email mapping to the alert-trigger table

## Gumroad fulfillment (once product exists)

1. Create Gumroad product "Score-Watch Alert" at $79/year recurring
2. Copy product URL (looks like `https://compassionbenchmark.gumroad.com/l/XXXXX`)
3. Edit `site/src/data/gumroad.ts`:
   ```ts
   scoreWatch: "https://compassionbenchmark.gumroad.com/l/XXXXX",
   ```
4. Flip the feature flag in the same file:
   ```ts
   export const SCORE_WATCH = {
     useGumroad: true,  // was false
     ...
   }
   ```
5. Rebuild and redeploy. Every entity page's Subscribe CTA will route to `${GUMROAD.scoreWatch}?entity={slug}` instead of the contact-sales form.
6. Gumroad webhook (separate setup) pipes `entity` query param into the subscriber record on purchase.

## Alert-trigger hook point (to be implemented)

The overnight pipeline in `research/` already writes daily briefings to `site/src/data/updates/<date>.json` containing `entityScoreChanges[]`.

The future alert-trigger script should:

1. Read today's daily briefing JSON
2. For each `entityScoreChange` entry, look up subscribers keyed by `(indexSlug, entitySlug)`
3. Render an email template containing delta, band change, evidence, entity page link
4. Send via transactional email (SendGrid / Postmark / Resend — TBD)
5. Log send result to `research/score_watch_sends/<date>.json`

Subscriber table schema (recommendation):

```
score_watch_subscribers.csv
---------------------------
email, index_slug, entity_slug, started_at, expires_at, status, stripe_sub_id
```

Keyed queries: `WHERE index_slug = ? AND entity_slug = ? AND status = 'active'`.

## Analytics events (already wired)

- `score_watch_click` — fired when the Subscribe button on an entity page is clicked. Payload: `{entity_slug, entity_kind, entity_name}`
- `score_watch_signup` — fired when the `/contact-sales` form is submitted with `service === "score-watch"`. Payload: `{entity_slug, entity_kind, entity_name}`
- `gumroad_click` — fires automatically if user clicks a Gumroad URL (including Score-Watch once `useGumroad = true`). Payload: `{product: "scoreWatch"}`

Funnel in Umami:

```
entity page view → score_watch_click → score_watch_signup
```

Denominator: per-entity page views. Numerator: `score_watch_signup` events filtered by `entity_slug`.

## Independence policy compliance

- Subscription purchase does not affect the score or move the entity up/down
- Subscribers do not receive early access to score changes vs. the public daily briefing
- Score-Watch is explicitly a *notification convenience product*, not a *score influence product*
- Copy on `/score-watch` states this: "Subscription purchase does not affect the score. Entities never pay for inclusion, score changes, or suppression."

## Files

- `site/src/app/score-watch/page.tsx` — landing page
- `site/src/data/gumroad.ts` — `SCORE_WATCH` config + `scoreWatch` URL
- `site/src/components/entity/EntityDetail.tsx` — Score-Watch card on every entity page
- `site/src/components/purchase/SalesInquiryForm.tsx` — MVP fulfillment form handling
- `site/src/data/nav.ts` — footer nav link
