# PRD: Score-Watch Alert (End-to-End) + Monetization Expansion

**Version:** 1.0  
**Date:** 2026-05-17  
**Owner:** Product  
**Status:** Ready for engineering handoff  
**Downstream consumers:** backend-engineer, frontend-engineer, analytics

---

## 0. Current state snapshot

| Surface | State |
|---|---|
| Score-Watch marketing page (`/score-watch`) | Live. Subscribe button routes to `/contact-sales` (manual fulfillment). |
| Entity-page Score-Watch CTA | Live. `SCORE_WATCH.useGumroad = false` — same contact-sales routing. |
| Gumroad Score-Watch URL | Placeholder (`TODO-score-watch`). Product not created. |
| US Cities + US States Gumroad products | Missing. Shown as "coming soon" on `/purchase-research`. |
| Listmonk | Live (newsletter). No transactional templates created. |
| Formspree `xojyjllo` | Live (shared form). Sales inquiries route here manually. |
| Research pipeline | Runs nightly. Produces `research/change-proposals/*.json`. |

---

## 1. Problem statement

**Who:** Investors, analysts, journalists, policy teams, and executives who need to know when a specific institution's compassion score moves — before the news cycle does.

**Pain:** No automated alert exists. A subscriber who wants to track one entity must submit a manual inquiry form and wait for human fulfillment. This kills conversion: high-intent visitors (arriving directly from entity detail pages) hit a form and leave.

**Job to be done:** Know immediately when an entity I care about changes — with enough context (delta, band, evidence) to act or brief stakeholders.

**Why now:** The overnight research pipeline already produces change proposals. The data is there; the delivery layer (Gumroad product + Listmonk triggered alert) is the only missing piece. Every day without this is lost subscription revenue and subscriber churn at the moment of highest intent.

---

## 2. Independence policy (non-negotiable)

All monetization work must satisfy this rule: **entities never pay for inclusion, score changes, or suppression.**

Score-Watch operationally enforces this by:
- Alert trigger = research pipeline output only (change proposals). No commercial event can touch the trigger.
- Subscriber purchase is decoupled from entity scoring. The pipeline has no awareness of who has purchased a watch.
- Audit trail: change proposal JSON files are the source of record. Alert sends cite the proposal ID.
- Score-Watch must never be marketed as a service entities purchase about themselves to influence outcomes. Framing must always be third-party observer framing.

---

## 1. Score-Watch Alert — end-to-end product spec

### 1.1 Product definition

| Field | Value |
|---|---|
| Product name | Score-Watch Alert |
| Price | $79 / year / entity |
| Billing | Annual, Gumroad subscription |
| Delivery | Listmonk transactional email |
| Entity scope | One subscription = one entity. Add more entities = buy again. |
| Alert frequency | Per change event (not digest). Up to once per entity per pipeline run. |
| Pipeline cadence | Mon–Sat overnight. Alerts land by 07:00 local time of recipient (best effort; actual: send on pipeline completion). |

### 1.2 Subscribe flow

**Entry points (two):**

1. Entity detail page → Score-Watch CTA panel → "Subscribe — $79/yr" button  
2. `/score-watch` marketing page → "Subscribe" button (no entity pre-selected; routes to entity browser)

**Gumroad checkout flow (after Gumroad product is created):**

1. Flip `SCORE_WATCH.useGumroad = true` in `site/src/data/gumroad.ts`
2. Paste live Gumroad URL into `GUMROAD.scoreWatch`
3. Entity-page button href becomes: `${GUMROAD.scoreWatch}?entity={slug}&name={encodedName}&kind={kind}`
4. Gumroad custom field (required at checkout): **"Entity you are watching"** — pre-filled from query param `entity` if Gumroad supports it; otherwise buyer types it.
5. On purchase complete, Gumroad fires webhook to fulfillment endpoint (see §1.8 — static site constraint means webhook receiver must be external)

**Data shape passed through checkout:**

```
entity_slug: string        // e.g., "apple-inc"
entity_name: string        // e.g., "Apple Inc."
entity_kind: string        // e.g., "fortune-500"
buyer_email: string        // captured by Gumroad
purchase_id: string        // Gumroad order ID
purchased_at: ISO8601
expires_at: ISO8601        // purchased_at + 365 days
```

**Static site constraint:** The Next.js app cannot receive webhooks. Webhook receiver must be a lightweight external endpoint — options: Formspree (no, wrong tool), a Cloudflare Worker, a Make.com/Zapier webhook, or a minimal VPS endpoint. Recommend Cloudflare Worker or Make.com scenario to minimize new infrastructure. This is an architecture decision for the backend engineer.

### 1.3 Welcome email

**Trigger:** Gumroad purchase confirmed + subscriber record created in Listmonk  
**Send timing:** Within 15 minutes of purchase  
**From:** alerts@compassionbenchmark.com  
**Subject:** `Score-Watch active: {Entity Name}`

**Body (plain text + HTML):**

```
Your Score-Watch Alert is active.

Entity:       {Entity Name}
Watch period: {purchase_date} – {expiry_date}
Alert type:   Email on every score change, overnight Mon–Sat

What you'll receive:
- Composite score delta (e.g., 61.2 → 58.8, –2.4 pts)
- Band change flag (e.g., Functional → Developing) when applicable
- Headline evidence (1–3 bullet points from the research pipeline)
- Link to the full entity assessment on compassionbenchmark.com

To add another entity, return to its detail page and subscribe again.
To cancel, use the Gumroad cancellation link below or email alerts@compassionbenchmark.com.

Independence note: Your subscription purchase does not affect {Entity Name}'s score.
Scoring is determined by the independent overnight research pipeline only.

Manage subscription: {Gumroad manage link}
Unsubscribe: {Listmonk unsubscribe link}
```

### 1.4 Daily alert email

**Trigger:** Research pipeline produces a change proposal for an entity that has at least one active Score-Watch subscriber  
**Timing:** Sent on pipeline completion (target: by 07:00 local; pipeline owner defines exact timing)  
**From:** alerts@compassionbenchmark.com  
**Subject:** `Score change: {Entity Name} | {old_score} → {new_score} ({delta:+.1f})`

**Body:**

```
Score change detected: {Entity Name}
{change_date}

COMPOSITE SCORE
{old_score} → {new_score} ({delta:+.1f} pts)

BAND CHANGE
{if band_changed: "{old_band} → {new_band}" else: "Band unchanged ({current_band})"}

HEADLINE EVIDENCE
- {evidence_item_1}
- {evidence_item_2}
- {evidence_item_3}  (max 3 items from change proposal)

FULL ASSESSMENT
{entity_detail_url}

---
This alert was generated by the independent Compassion Benchmark research pipeline.
Score changes are not initiated by commercial activity.
Source: change-proposal-{proposal_id}.json | Overnight run: {run_date}

Manage subscription: {Gumroad manage link}
Unsubscribe: {Listmonk unsubscribe link}
```

**Data source:** `research/change-proposals/{proposal_id}.json` — pipeline must expose at minimum:
- `entity_slug`
- `old_score`, `new_score`, `delta`
- `old_band`, `new_band`
- `evidence: string[]` (array of headline evidence strings)
- `proposal_id`
- `run_date`

If the pipeline does not currently expose `evidence` strings in structured form, the alert falls back to: "Full evidence available at {entity_detail_url}"

### 1.5 Subscriber management

**What a subscriber can do:**

| Action | Mechanism |
|---|---|
| See active watches | Gumroad purchase history (Gumroad-native) |
| Add another watch | Return to entity page → buy again (separate subscription) |
| Cancel a watch | Gumroad cancellation link in every email |
| Change watched entity | Not supported. Cancel + rebuy. State this explicitly in welcome email. |
| Update email address | Gumroad account settings |

**No subscriber dashboard on compassionbenchmark.com.** This is by design for the static site. The Gumroad account is the subscriber's management surface.

### 1.6 Renewal and cancellation

- **Renewal:** Gumroad handles annual auto-renewal. Subscriber receives Gumroad's standard renewal notice.
- **Cancellation:** Subscriber cancels via Gumroad link. On cancellation, Gumroad webhook fires → fulfillment system marks subscriber inactive in Listmonk → no further alerts sent.
- **Expiry without renewal:** Same as cancellation.
- **Grace period:** 0 days. Alerts stop on expiry date.

### 1.7 Refund policy

- Full refund if requested within 14 days of purchase and no alert has been delivered.
- Pro-rated refund (unused months × ($79/12)) if requested after first alert delivered, up to 90 days.
- No refund after 90 days.
- Refund requests: email alerts@compassionbenchmark.com. Processed manually within 5 business days via Gumroad refund.
- Policy must be stated on `/score-watch` page and in welcome email.

### 1.8 Fulfillment pipeline (architecture constraint for backend engineer)

The static Next.js site cannot run server-side code. The fulfillment loop requires an external component:

**Required external functions:**
1. **Webhook receiver:** Accepts Gumroad purchase/cancellation events
2. **Subscriber store:** Maps `{entity_slug, buyer_email, expires_at, gumroad_order_id}` — can be a simple Listmonk custom segment, a Cloudflare KV store, or a lightweight database
3. **Alert dispatcher:** Nightly — reads change proposals → looks up active subscribers for each entity → sends Listmonk transactional email per subscriber

This PRD does not prescribe the implementation. The backend engineer must propose the architecture. Acceptance criteria for this layer are in §3.

### 1.9 Acceptance criteria — Score-Watch end-to-end

- [ ] Gumroad product created and URL live in `GUMROAD.scoreWatch`
- [ ] `SCORE_WATCH.useGumroad` flipped to `true`
- [ ] Entity-page CTA button routes to Gumroad with `entity` slug pre-populated
- [ ] `/score-watch` page CTA routes to entity browser (not contact-sales)
- [ ] Gumroad purchase → welcome email sent within 15 minutes
- [ ] Welcome email includes entity name, watch period dates, refund policy link
- [ ] Change proposal for a watched entity → alert email sent to all active subscribers for that entity on same pipeline run day
- [ ] Alert email includes: score delta, band change flag, at least 1 evidence item, entity detail URL
- [ ] Alert email includes unsubscribe link (Listmonk)
- [ ] Gumroad cancellation → subscriber deactivated → no further alerts sent within 24 hours of cancellation
- [ ] Expired subscription (365 days, no renewal) → no alert sent after expiry date
- [ ] No alert is sent for a score change that does not appear in a change proposal (i.e., alert system cannot trigger independently)
- [ ] Umami event `score_watch_click` fires on entity-page CTA click with `{entity_slug, entity_kind, entity_name}`
- [ ] Umami event `score_watch_purchase_confirmed` fires on Gumroad success redirect (if Gumroad supports redirect with params)
- [ ] Alert open rate tracked via Listmonk campaign stats

---

## 2. Monetization expansion — prioritized roadmap

### 2.1 Scoring method

Score = Impact + Strategic Alignment − Effort − Risk (each 1–5)

### 2.2 Priority table

| # | Initiative | Impact | Align | Effort | Risk | Net | Priority |
|---|---|---|---|---|---|---|---|
| A | Complete Score-Watch (flip useGumroad) | 5 | 5 | 2 | 1 | **7** | **P0** |
| B | US Cities + US States Gumroad products (parity) | 4 | 4 | 1 | 1 | **6** | **P0** |
| C | Score-Watch portfolio bundles (5-entity $299/yr, 25-entity $999/yr) | 4 | 5 | 3 | 2 | **4** | **P1** |
| D | CSV/JSON one-time data downloads ($49–$99 per index) | 4 | 4 | 2 | 2 | **4** | **P1** |
| E | Sector deep-dive reports ($295, e.g., "Big Tech AI Labs") | 4 | 4 | 4 | 2 | **2** | **P1** |
| F | Supporter / tip tier ($5/$10/$25/mo, no product) | 2 | 3 | 2 | 1 | **2** | **P2** |
| G | Annual subscription — weekly briefing premium tier ($99/yr) | 3 | 3 | 4 | 3 | **-1** | **P2** |
| H | Badge / embed widget (free, traffic + links) | 3 | 3 | 4 | 1 | **1** | **P2** |
| I | API tier for institutional buyers ($X/mo) | 5 | 5 | 5 | 3 | **2** | **P2** (revisit at 500+ subscribers) |
| J | Conference/press kit (free) | 2 | 3 | 2 | 1 | **2** | **P2** |
| K | Certified assessment — pricing + flow clarification | 3 | 4 | 2 | 1 | **4** | **P1** |

### 2.3 P0 rationale

**A — Score-Watch Gumroad flip:** Zero new product work. Single config change + Gumroad product creation + fulfillment pipeline. Highest revenue-per-effort ratio in the backlog.

**B — US Cities + US States Gumroad products:** Index data exists. Two missing Gumroad products break the self-serve parity story. One card on `/purchase-research` currently dead-ends to contact-sales. Effort = ~2 hours (create Gumroad products, add URLs to `gumroad.ts`, update purchase-research page).

### 2.4 P1 rationale

**C — Portfolio bundles:** Unlocks institutional buyers watching peer groups. $299/yr for 5 entities = $59.80/entity vs $79 single — margin still healthy, ACV triples. Requires bundle Gumroad product + subscriber logic that maps one purchase to N entity watches.

**D — CSV/JSON downloads:** Existing data is already structured JSON. Packaging as a download product requires creating the download file + Gumroad delivery. No backend required (Gumroad handles file delivery). Price point $49–$99 captures researchers who don't need the PDF.

**E — Sector deep-dive reports:** Higher margin, lower volume. "Big Tech AI Labs Deep-Dive" is a natural first report given AI Labs index is complete. Requires editorial effort (report writing), not engineering. Engineering effort = Gumroad product + one page. Editorial effort = 4–8 hours.

**K — Certified assessment pricing fix:** Page exists at `/certified-assessments`. No clear price or call to action. Fixing this is a copy + form routing change, not a product build. High alignment with existing institutional buyer intent.

---

## 3. User stories and acceptance criteria — P0 items

### P0-A: Score-Watch end-to-end (Gumroad flip)

**Story 1**  
As an investor tracking a portfolio company, I want to subscribe to Score-Watch from the company's entity page so that I receive an email the moment its compassion score changes.

Acceptance criteria:
- [ ] Entity detail page CTA button links to Gumroad checkout with entity slug pre-populated in a custom field
- [ ] Checkout completes and produces a Gumroad order record
- [ ] Welcome email arrives within 15 minutes of purchase
- [ ] Welcome email names the entity I purchased a watch for
- [ ] Welcome email states the watch expiry date

**Story 2**  
As a Score-Watch subscriber, I want to receive an alert email when my watched entity's score changes so that I can act before the news cycle does.

Acceptance criteria:
- [ ] Alert email is sent on the same calendar day the change proposal is produced
- [ ] Alert email subject line contains entity name and score delta
- [ ] Alert email body includes: old score, new score, delta, band change status (changed or unchanged), at least 1 evidence item, link to entity detail page
- [ ] Alert email includes a one-click unsubscribe link

**Story 3**  
As a Score-Watch subscriber who wants to stop tracking an entity, I want to cancel my subscription so that I stop being charged and stop receiving alerts.

Acceptance criteria:
- [ ] Gumroad cancellation link is present in every alert email and welcome email
- [ ] After cancellation, no further alerts are sent for that entity to that subscriber
- [ ] Cancellation takes effect within 24 hours of the Gumroad cancellation event

**Story 4**  
As a site visitor on `/score-watch`, I want to understand what I get and subscribe without a sales conversation so that I can start tracking an entity today.

Acceptance criteria:
- [ ] Hero "Subscribe" button on `/score-watch` does not route to contact-sales
- [ ] Clicking "Subscribe" from `/score-watch` (no entity selected) routes to the entity browser (`/indexes`) with a visible prompt to select an entity and subscribe from its detail page
- [ ] Refund policy is visible on the `/score-watch` page (not buried in email)

---

### P0-B: US Cities + US States Gumroad products

**Story 1**  
As a policy researcher, I want to purchase the U.S. States Index as a self-serve download so that I don't have to submit a form and wait.

Acceptance criteria:
- [ ] Gumroad product created for U.S. States Index
- [ ] `GUMROAD.usStatesIndex` key exists in `gumroad.ts` with live URL
- [ ] `/purchase-research` page shows U.S. States Index as a live purchasable card (not "coming soon")
- [ ] U.S. States entity detail pages show correct `config.gumroadUrl` for the index purchase CTA
- [ ] Gumroad product delivers the downloadable report file on purchase

**Story 2**  
As a civic tech analyst, I want to purchase the U.S. Cities Index as a self-serve download so that I can analyze city-level compassion scores programmatically.

Acceptance criteria:
- [ ] Gumroad product created for U.S. Cities Index
- [ ] `GUMROAD.usCitiesIndex` key exists in `gumroad.ts` with live URL
- [ ] `/purchase-research` page shows U.S. Cities Index as a live purchasable card
- [ ] U.S. Cities entity detail pages show correct `config.gumroadUrl` for the index purchase CTA
- [ ] Gumroad product delivers the downloadable report file on purchase

---

## 4. Success metrics

### P0-A: Score-Watch

| Metric | Before state | Target (90 days post-launch) | Measurement |
|---|---|---|---|
| Score-Watch conversion rate (visit `/score-watch` → purchase) | ~0% (contact form, no Gumroad) | ≥ 2% | Umami: `score_watch_click` / page views |
| Score-Watch subscribers | 0 | 25 paid subscribers | Gumroad subscriber count |
| Monthly recurring revenue from Score-Watch | $0 | $165/mo annualized run-rate (25 × $79 / 12) | Gumroad revenue dashboard |
| Alert email open rate | No baseline | ≥ 45% | Listmonk campaign stats |
| Alert email unsubscribe rate per send | No baseline | ≤ 2% per send | Listmonk campaign stats |
| Annual churn rate | No baseline | ≤ 20% at first renewal | Gumroad renewal data |
| Fulfillment SLA: welcome email < 15 min | Not measured | 100% of purchases | Listmonk send timestamp vs Gumroad order timestamp |
| Fulfillment SLA: alert sent same day as change proposal | Not measured | ≥ 95% of events | Pipeline logs |

**Leading indicator (week 1):** `score_watch_click` events in Umami. If clicks are occurring but purchases are not, investigate Gumroad checkout drop-off.

### P0-B: US Cities + US States Gumroad products

| Metric | Before state | Target (30 days post-launch) | Measurement |
|---|---|---|---|
| US States / US Cities index sales | 0 (contact form only) | ≥ 5 combined purchases | Gumroad order count |
| "Coming soon" dead-end exits on `/purchase-research` | Unmeasured | 0 exits from those cards (replaced by live CTA) | Umami outbound click events on Gumroad URLs |
| Revenue from US indexes | $0 | $975+ (5 × $195) | Gumroad revenue |

---

## 5. Out of scope (this loop)

The following are explicitly excluded from the current build loop:

- Score-Watch portfolio bundles (5-entity, 25-entity) — P1, after single-entity flow is stable
- CSV/JSON self-serve data downloads — P1, requires data packaging work
- Sector deep-dive reports — P1, requires editorial work
- Supporter/tip tier — P2, low revenue impact
- Annual premium briefing subscription — P2, requires Listmonk subscription tier logic
- Badge/embed widget — P2, requires embeddable JS build
- API tier — P2, requires infrastructure not yet in scope
- Conference/press kit — P2, pure content
- Certified assessment pricing fix — P1, separate ticket
- Subscriber dashboard on compassionbenchmark.com — not compatible with static export; use Gumroad native
- Multi-entity subscription management UI — out of scope for static site
- Changing the independence policy — never in scope
- Score-Watch for entities NOT currently in the benchmark — not supported; entity must have a detail page

---

## 6. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gumroad webhook reliability — missed purchase event means subscriber never enrolled | Medium | High | Implement idempotent retry on webhook receiver; daily reconciliation job that compares Gumroad orders to Listmonk subscriber list |
| Change proposal does not fire for real score change — subscriber misses an alert | Low | High | Unit test on pipeline alert dispatcher: assert every change proposal file for a watched entity produces a send attempt |
| Alert sent to expired subscriber (billing lapsed, no cancellation) | Medium | Low | Subscriber record includes `expires_at`; dispatcher checks expiry before send |
| Independence-policy violation: entity pays to suppress a change proposal | Very low | Critical | Pipeline has no input from commercial systems. Enforce at code level: alert dispatcher reads only `research/change-proposals/*.json` — no commercial DB lookup in trigger path. Audit log of all sent alerts with proposal_id. |
| Independence-policy violation: Score-Watch marketed to entities as an influence tool | Low | Critical | All copy must frame Score-Watch as observer product (investors, journalists, analysts). Never use "manage your score" or "know before regulators" framing directed at the entity itself. Review all email templates before launch. |
| Refund dispute: subscriber claims they received no alerts (entity never changed score) | Medium | Low | Welcome email sets expectation: "alerts only fire on score changes; if the score does not change, no alert is sent." Offer prorated refund per policy. Log absence of alerts for subscriber's entity. |
| Listmonk transactional email deliverability | Medium | Medium | Use a dedicated sending domain (`alerts@compassionbenchmark.com`), SPF/DKIM configured, warm up sending volume. Test deliverability before launch. |
| Subscriber email privacy: PII (email + entity interest) stored in external systems | Low | Medium | Gumroad and Listmonk are the data processors. Privacy policy must disclose use of Gumroad and Listmonk. No additional PII storage. Webhook receiver must not log email addresses to plaintext logs. |
| Static site constraint: Gumroad custom field not auto-populated from URL | Medium | Low | Test Gumroad checkout URL `?entity=` parameter behavior before launch. If not supported, add visible "Entity Name" text field to Gumroad product and instruct buyer to enter the entity name. Fallback: buyer types entity name; fulfillment team confirms from detail page URL in Gumroad purchase note. |
| US States data gap (only 21 of 51 states in JSON) | High | Medium | Gumroad product and page copy must state "21 states scored to date — full index in progress." Do not promise 51 states. Update copy when data expands. |

---

## 7. Open questions (flagged assumptions)

1. **Webhook receiver infrastructure:** What is the preferred lightweight receiver? Cloudflare Worker, Make.com webhook, or a new route on the existing VPS? Backend engineer must decide.

2. **Change proposal JSON schema:** Does `research/change-proposals/*.json` currently include structured `evidence: string[]` fields? If not, alert email falls back to a link-only format. Confirm with pipeline owner before writing alert template.

3. **Gumroad subscription vs one-time product:** Should Score-Watch be a Gumroad "subscription" product (auto-renewing) or a one-time product with manual renewal reminder? Gumroad subscription is preferred for renewal automation but requires confirming Gumroad sends cancellation webhooks on non-renewal. Confirm before product creation.

4. **Listmonk transactional email setup:** Is Listmonk configured for transactional (non-campaign) sends? Alert emails are not batch campaigns — they are triggered per-event per-subscriber. Confirm transactional API is enabled.

5. **`/score-watch` CTA destination (no entity selected):** Routing to `/indexes` is specified above. If UX determines a better landing (e.g., a "pick an entity to watch" prompt on `/score-watch` itself), this is a frontend decision — but it must not route to contact-sales.

6. **Alert sending time:** "By 07:00" is a target. Actual send time depends on pipeline completion. If pipeline runs at 03:00 and takes 2 hours, sends hit at 05:00. Confirm pipeline completion time window so email subject line timing claim is accurate.

7. **US Cities + US States report files:** Do publishable PDF or CSV report files exist for these two indexes, or do they need to be created before Gumroad products can deliver them?

---

## 8. Handoff checklist

Before implementation begins, confirm:

- [ ] Gumroad account access confirmed (for product creation)
- [ ] Listmonk transactional email API confirmed available
- [ ] Change proposal JSON schema reviewed — `evidence` field present or fallback confirmed
- [ ] Webhook receiver approach agreed (backend engineer)
- [ ] `alerts@compassionbenchmark.com` sending domain configured (SPF/DKIM)
- [ ] US Cities + US States report files exist or creation scoped separately
- [ ] Privacy policy updated to disclose Gumroad and Listmonk data processing
- [ ] Refund policy added to `/score-watch` page
