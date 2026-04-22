# Score-Watch — Gumroad Product Setup Checklist

**Objective:** Create the Score-Watch Alert subscription product on Gumroad, wire it into the site, and stand up a minimal week-1 fulfillment loop.

**Time budget:** 45 minutes for MVP (manual weekly export); 3 hours including Ping webhook ingestion.

**Prerequisites:**
- Access to `compassionbenchmark.gumroad.com` (creator account already exists — other research-asset products live there)
- Payout account linked (Stripe or PayPal already configured on that Gumroad account)
- VPS access for redeploy after site flag flip

---

## 1. Pre-flight — Gumroad account settings (5 min)

Before creating the product, confirm these account-level settings. Do this once; subsequent subscription products inherit them.

**Settings → Payments**
- ☐ Payout method confirmed, $79/yr can clear

**Settings → Advanced → Ping**
- ☐ Ping URL field — leave empty for now. We'll set this in §6 once the endpoint exists. For week 1, fulfillment is manual via CSV export.

**Settings → Checkout**
- ☐ "Generate unique URLs for each product" — enabled (default)
- ☐ "Display custom fields on checkout" — enabled

**Settings → Emails**
- ☐ Seller email confirmed (`phil@mediafier.ai`) — this is where purchase notifications arrive
- ☐ "Send receipt to customer" — enabled

---

## 2. Create the product (10 min)

Gumroad dashboard → **New Product** → **Membership**.

| Field | Value |
|---|---|
| Product name | `Score-Watch Alert` |
| Type | Membership (subscription) |
| Pricing model | Fixed price |
| Price | `$79` |
| Recurrence | Yearly |
| Free trial | None |
| Tiers | Single tier only — do not enable tiered pricing |
| Product URL slug | `score-watch` (requests `https://compassionbenchmark.gumroad.com/l/score-watch`) |
| Currency | USD |
| Cover image | Reuse the Score-Watch hero graphic from `/score-watch` landing page if available, otherwise plain logo card |
| Call to action | `Subscribe` |

**After save:** Copy the final product URL. It will look like `https://compassionbenchmark.gumroad.com/l/score-watch` if the slug was available, or `.../l/XXXXX` if Gumroad auto-generated. Both work — store the exact URL for §5.

---

## 3. Product description — ready to paste

Paste the block below into the **Description** field. Gumroad supports Markdown-style headings and bullets but renders them as HTML; the formatting below is what displays on the product page.

```
Score-Watch Alert

A per-entity email subscription that tells you when a tracked institution's Compassion Benchmark score moves materially — composite delta of 5 or more, a band change, or an urgent flag.

When the overnight research pipeline confirms a qualifying change, you receive an email the next morning containing:

• The composite delta and new score
• The band change, if any (e.g., Exemplary → Established)
• The headline evidence summary
• A link to the full assessment on compassionbenchmark.com

Coverage: any one of 1,155 entities across seven indexes — Fortune 500, countries, AI labs, robotics labs, U.S. states, global cities, U.S. cities.

Price: $79 per entity per year. Cancel anytime from your Gumroad library; Gumroad handles prorated refunds per their standard policy.

After checkout, tell us which entity you want to watch using the required field on the checkout page. Your first alert fires within 24 hours of the next qualifying change on that entity.

Independence policy: Entities never pay for inclusion, score changes, or suppression of findings. A Score-Watch subscription is a notification convenience product. It does not affect the score, accelerate research, or provide early access to findings ahead of public publication.

Questions: phil@mediafier.ai
```

---

## 4. Custom required field (2 min)

Gumroad dashboard → Score-Watch product → **Content** tab → **Add a custom field**.

| Field | Value |
|---|---|
| Field type | Text |
| Label | `Which entity do you want to watch?` |
| Helper text | `Exact name as shown on compassionbenchmark.com — e.g., "Apple", "Microsoft", "Anthropic", "France". For multiple entities, purchase a separate subscription per entity.` |
| Required | ✅ Yes |
| Visible on | Checkout page |

**Why a text field, not a dropdown:** 1,155 entities is past the usable ceiling for a Gumroad dropdown, and text lets the customer be specific about Fortune 500 vs. AI lab vs. country disambiguation. The text response arrives in the purchase notification email and in the Ping webhook payload as `custom_fields[0].value`.

---

## 5. Flip the site feature flag (5 min)

Once the product is live and you have the final URL:

**Edit `site/src/data/gumroad.ts`:**

```ts
scoreWatch: "https://compassionbenchmark.gumroad.com/l/score-watch",  // paste real URL

export const SCORE_WATCH = {
  useGumroad: true,   // was false
  ...
} as const;
```

**Deploy:**
```bash
ssh root@<VPS-IP>
cd /root/applied-compassion-benchmark
git pull origin main
bash deploy.sh
```

After deploy, every entity page's Subscribe CTA routes directly to `${GUMROAD.scoreWatch}?entity={slug}` instead of the contact-sales form. The `entity` query param is not used by Gumroad itself — it's captured by Umami on the outbound click so we can funnel-match clicks to purchases.

---

## 6. Ping webhook — week-2 upgrade path

**Week 1 (recommended start):** Skip this section. Gumroad emails you each sale; you maintain `research/score_watch_subscribers.csv` manually and the overnight pipeline reads that CSV. 10 subscribers is trivial to manage by hand.

**Week 2+ (once volume justifies it):** Stand up a Ping endpoint.

### Ping URL configuration

Gumroad → **Settings → Advanced → Ping** → paste:
```
https://compassionbenchmark.com/api/gumroad-ping
```

**Security:** Gumroad does not sign Ping requests. Add a shared secret as a query parameter the endpoint checks against an env var (`GUMROAD_PING_SECRET`):
```
https://compassionbenchmark.com/api/gumroad-ping?secret=<long-random-string>
```

**Note:** The site is a static export. The Ping endpoint has to live somewhere with a runtime — either (a) a small Node/Express service colocated on the VPS behind Nginx at `/api/gumroad-ping`, or (b) a Cloudflare Worker / Vercel serverless function at a subdomain. (a) keeps ops single-box.

### Expected payload shape

Gumroad Ping sends `application/x-www-form-urlencoded` POST. Minimal fields we care about:

| Field | Example | Use |
|---|---|---|
| `seller_id` | `XXXXXXXX` | Verify it's our account |
| `product_id` | `XXXXXXXX` | Verify it's Score-Watch (reject other products) |
| `product_permalink` | `score-watch` | Same verification |
| `email` | `buyer@example.com` | Subscriber identity |
| `full_name` | `Jane Buyer` | For the alert email salutation |
| `sale_id` | `XXXXXXXX` | Idempotency key |
| `subscription_id` | `XXXXXXXX` | For cancel/refund matching |
| `custom_fields[0][name]` | `Which entity do you want to watch?` | Field label |
| `custom_fields[0][value]` | `Apple` (free text from customer) | **Entity name — human-normalized** |
| `resource_name` | `sale` / `subscription_cancelled` / `subscription_ended` / `subscription_restarted` | Event type |
| `test` | `true` / `false` | Filter out test purchases |

### Endpoint skeleton (Express)

```js
// gumroad-ping.mjs — minimal Ping receiver
import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
app.use(express.urlencoded({ extended: true }));

const SECRET = process.env.GUMROAD_PING_SECRET;
const PRODUCT_PERMALINK = "score-watch";
const SUBSCRIBERS_CSV = path.resolve("research/score_watch_subscribers.csv");

app.post("/api/gumroad-ping", async (req, res) => {
  if (req.query.secret !== SECRET) return res.status(401).end();

  const p = req.body;
  if (p.test === "true") return res.status(200).end();  // ignore test sales
  if (p.product_permalink !== PRODUCT_PERMALINK) return res.status(200).end();

  const entityRaw = p["custom_fields[0][value]"] || "";
  const event = p.resource_name || "sale";

  const row = [
    new Date().toISOString(),
    event,
    p.sale_id || "",
    p.subscription_id || "",
    p.email || "",
    p.full_name || "",
    entityRaw.replace(/,/g, " "),   // strip commas to stay CSV-safe
  ].join(",");

  await fs.appendFile(SUBSCRIBERS_CSV, row + "\n", "utf8");
  res.status(200).end();
});

app.listen(3001);
```

The appended CSV is deliberately raw — `email` plus `entityRaw` (customer's free-text entity name). A separate nightly resolver script (next section) normalizes the free text to `(index_slug, entity_slug)`.

### Entity-name resolver

The customer will type "Apple" or "apple inc" or "Apple Inc." The resolver:

1. Read the raw-text column from `score_watch_subscribers.csv`
2. For unresolved rows, fuzzy-match against entity names across all 7 index JSONs in `site/src/data/indexes/`
3. On confident match: write `(index_slug, entity_slug)` to the canonical subscriber table
4. On ambiguous match: flag for manual review (low volume, fine to handle by hand)

The nightly digest already writes `scoreChanges[]` with `{index, slug, name, composite, delta, band_change}`. Alert dispatch then joins that list to the active-subscribers table keyed on `(index, slug)` and sends one email per matched pair via Listmonk.

---

## 7. Alert email template — draft for Listmonk

Once Listmonk is wired (already pending env vars from earlier backlog), create a template named `score-watch-alert` with this body:

```
Subject: Score moved — {{ .EntityName }} is now {{ .NewComposite }} ({{ .Band }})

Hi {{ .FirstName }},

Overnight research confirmed a material score change on {{ .EntityName }}, the entity you're watching.

Score: {{ .OldComposite }} → {{ .NewComposite }}  ({{ .DeltaSigned }})
Band: {{ .BandChange }}
Date: {{ .AssessmentDate }}

Headline evidence:
{{ .EvidenceSummary }}

Full assessment:
https://compassionbenchmark.com{{ .EntityHref }}

Today's full daily briefing:
https://compassionbenchmark.com/updates/{{ .AssessmentDate }}

—

Score-Watch observes. It does not affect the score. Entities never pay for inclusion, score changes, or suppression of findings.

Manage your subscription:
https://gumroad.com/library
```

Template variables populated from the digest JSON + the subscriber record; the dispatcher is a small Node script invoked after the nightly digest finishes.

---

## 8. Testing checklist

After §2–§5 ship, before announcing the product:

- ☐ Open `/score-watch` in an incognito window — Subscribe button links to the Gumroad URL (not `/contact-sales`)
- ☐ Open any Fortune 500 entity page, e.g. `/company/apple` — Subscribe card on the entity page links to `${scoreWatch}?entity=apple`
- ☐ On Gumroad, purchase the product as yourself with a test card in Gumroad's test mode (`?test=true` on checkout or via Gumroad test-mode toggle). Confirm:
  - ☐ Custom field `Which entity do you want to watch?` is required and visible
  - ☐ Receipt email arrives at seller email with the entity text captured
  - ☐ Cancellation from Gumroad library works and releases the subscription
- ☐ Umami: after the click-through, confirm `gumroad_click` event fires with `product: "scoreWatch"` and the `entity` query param visible on the destination URL

---

## 9. Independence-policy disclosure — where it lives

The independence line appears in **three** places related to this product. All three must stay in sync:

1. `/score-watch` landing page copy (already live)
2. Gumroad product description (§3 above — the final paragraph)
3. Alert email footer (§7 above — "Score-Watch observes")

Any rewording of the policy on one surface triggers updates on the other two.

---

## 10. Operational notes

- **Refunds:** Gumroad's standard refund policy applies — customer can request within their window; you can also issue manual refunds from the sale detail page. Record any refund in `score_watch_subscribers.csv` by setting `status=refunded` so the dispatcher skips that row.
- **Reporting:** Gumroad → Analytics shows daily sales, MRR contribution from subscriptions, and churn. Export weekly into `research/gumroad_weekly_<date>.csv` for trend analysis.
- **Tax:** Gumroad is Merchant of Record. They collect and remit VAT/sales tax globally. Your 1099 / tax statement reflects net payouts.
- **Fees:** Gumroad flat 10% of gross + processor fee (Stripe/PayPal standard). A $79 sale nets roughly $68.80 after fees. At 100 active subs, that's ~$6,880/yr recurring from Score-Watch alone before any other revenue.

---

## Done criteria

This checklist is complete when:

1. ☐ Gumroad product exists at a known URL
2. ☐ `SCORE_WATCH.useGumroad = true` in `gumroad.ts`, URL pasted
3. ☐ Site deployed — live-site click-through lands on Gumroad, not the contact form
4. ☐ One test purchase completed end-to-end (refund yourself after)
5. ☐ `docs/SCORE_WATCH.md` §"MVP fulfillment" updated to reflect live Gumroad state (line 28 footnote "`useGumroad === false`" flipped)

§6–§8 (Ping webhook, resolver, alert template) are week-2 work — not blocking for sales.
