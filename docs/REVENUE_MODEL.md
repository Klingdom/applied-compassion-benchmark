# Compassion Benchmark — Revenue Model & Offer Ladder

**Version:** 1.0 · **Date:** 2026-06-22 · **Role:** SaaS / data-product pricing & packaging strategist
**Status:** working strategy doc — prices are recommendations, not committed list prices. Items needing validation are flagged **[validate]**.

**Companion docs:** `docs/SALES_PLAN.md` (lead segments + 30-day outbound), `docs/GRANT_FUNDER_MAP.md` (funding independence flags), `docs/PRICING_LANDSCAPE_2026-04-20.md` (B2B comp set, WTP anchors). Prices here are reconciled against all three.

---

## 1. Summary

The fastest path to ~$10,000/month runs on **two recurring offers sold to ESG/impact investors**: the **Institutional Data License** (~$1.5k/mo) and the **Advisory Retainer** (~$2.5k/mo). Three licenses + two retainers = **$9,500 MRR** — a 5-deal target consistent with the Sales Plan's 60-day plan. Everything below those two anchors exists either to (a) feed the funnel (free alerts, daily briefing, public indexes), (b) capture the self-serve long tail without sales effort (Gumroad reports, Score-Watch, Pro), or (c) raise deal size for buyers who need a one-time artifact (custom deep-dive).

**The model is built around one hard rule:** every dollar comes from a **data USER** — investor, journalist, researcher, foundation, procurement team, university buyer — and **never from a scored entity** in exchange for inclusion, a score change, or suppression. The only offer that touches a scored entity (the Certified Assessment) is deliberately defined as a paid *process and report*, never a favorable *outcome*, and is recommended for **de-emphasis** (kept available, not promoted) because its perception cost on the AI Labs / Fortune 500 indexes outweighs its near-term revenue.

**Pricing-framing note (important reconciliation):** the Sales Plan and this doc lead with **monthly framing** ($1–2k/mo license, $2–5k/mo retainer) because that is the live outbound offer and it sets an ongoing-value expectation on a sales call. The existing `/data-licenses` and `/certified-assessments` pages use **annual ACV framing** ($500–$20k+/yr, $5–50k engagements). These are not in conflict — monthly is the entry/SMB framing for fast deals; annual ACV is the enterprise-procurement framing for the 90–180 day motion. The pricing page (§6) must show **both** so a $1.5k/mo prospect and a $30k/yr enterprise prospect each see themselves. **[validate]** the monthly anchors against the first 5 real quotes.

---

## 2. The Offer Ladder (overview table)

| # | Tier | Primary buyer | Price | Billing | Fulfillment / margin | Independence guardrail |
|---|---|---|---|---|---|---|
| 0 | **Free funnel** — Score Watch (free tier), Daily Briefing, public indexes | Anyone (lead capture) | $0 | — | Near-zero marginal; cost is the research engine that exists anyway | Public data, no entity money. Free for all incl. scored entities — but no entity can alter what it sees. |
| 1 | **Self-serve index report** (Gumroad) | Individual researcher, analyst, student, reporter on a one-off | **$49 individual / $195 commercial** per index | One-time | ~95% margin, fully automated (Gumroad) | Sold to data users. Buyer gets a snapshot; cannot influence scores. |
| 2 | **Score-Watch Alert** | Individual investor/analyst/reporter tracking 1–5 entities | **$79 / yr / entity** | Annual recurring | High margin once Gumroad+Worker live; auto-fulfilled | Entity cannot subscribe to suppress its own alert; alert reflects published score only. |
| 3 | **Pro subscription** | Active researcher / data journalist / solo analyst needing daily depth | **$59/mo or $590/yr** (target; range $500–$1k/mo only for multi-seat) | Monthly or annual | High margin; content is the daily engine; light gating work | User-side access tier. No entity-specific influence; same data for all subscribers. |
| 4 | **Custom deep-dive report** (1 entity or sector, all 40 subdimensions + evidence trail) | Fund writing a position memo; newsroom launching a series | **$3,500** one-time (range $2.5–5k) | One-time | Analyst-time heavy (~1–2 days); 60–75% margin | Commissioned by a data user about an entity; the entity does not commission or approve it. |
| 5 | **Institutional Data License / feed** (catalog + daily deltas, CSV/API) | ESG team, asset manager, portfolio monitoring, healthcare/AI desk | **$1,500/mo** (range $1–2k/mo; $12–20k/yr enterprise) | Monthly or annual recurring | Mostly automated once export pipeline + API live; high margin at scale, setup cost per first client | License grants access + usage rights only. Cannot alter inclusion, score, or rank. |
| 6 | **Advisory / briefing retainer** | ESG/IR/procurement/foundation team needing interpretation | **$2,500/mo** (range $2–5k/mo) | Monthly recurring (min 3-mo term) | Founder/analyst-time heavy; 50–65% margin; caps at ~4–6 clients solo | Advisory interprets published data for the buyer. Never advises a scored entity on raising its own score. |
| 7 | **Certified Assessment** (paid assessment *process* sold TO an entity) | A scored or unscored entity wanting a formal evidence review | **$5,000–$15,000** (process) | One-time | Analyst-time heavy | **De-emphasize.** Pays for the process + report ONLY — never a target score, rank, or favorable listing. See §5.7. |

---

## 3. Why these prices (comp-set rationale)

All anchors are grounded in `PRICING_LANDSCAPE_2026-04-20.md`:

- **Score-Watch $79/yr** sits at the Owler Pro floor ($35–$99/yr) — the only per-entity alert comp — but delivers a *scored, evidence-backed* signal Owler doesn't. Genuinely under-priced for professionals; kept at $79 deliberately as the low-friction first dollar. The professional WTP for the same signal is $500–$1k/entity/yr, which is captured by moving pros to the License rather than re-pricing the alert.
- **Self-serve report $49 / $195** maps to Morningstar sector reports ($49–$199) for individuals and the institutional/commercial-use band ($299–$499) compressed to a clean $195. IBISWorld/Gartner ($1,000–$2,500) is the ceiling we are deliberately *under* to keep self-serve frictionless.
- **Pro $59/mo** is below Eurasia Group GZERO individual ($2–8k/yr) and Factiva individual ($700–$2,500/yr) — positioned as a prosumer daily-intel sub, not an institutional seat. **[validate]** the Sales Plan references "$500–$1k/mo" for Pro; that band is realistic ONLY as a small-team/multi-seat Pro, not a solo SKU. Recommend selling solo Pro at $59/mo and reserving $500–$1k/mo for "Pro Team (3–5 seats)".
- **Custom deep-dive $3,500** sits between a boutique ESG sector briefing ($500–$5k) and a Gartner/Forrester single report ($1,495–$2,495), justified by the all-40-subdimension evidence trail. The Sales Plan's $2.5–5k range holds.
- **Data License $1.5k/mo (~$18k/yr)** is *below* every institutional ESG monitoring floor (MSCI $25k+, Sustainalytics $10k+, RepRisk $15k+, EcoVadis $5k+) — deliberately, to win fast against incumbents on price while the brand is young. The $12–20k/yr enterprise framing aligns with the existing `/data-licenses` "Institutional Data Pack $10,000+" tier.
- **Advisory $2.5k/mo (~$30k/yr)** maps to Oxford Analytica / Chatham House corporate ($15–50k/yr) and the existing `/certified-assessments` advisory band. Sold monthly to lower the activation barrier for the first close.

**Assumptions to validate with real buyers:** (1) monthly billing acceptance vs. annual-PO preference in ESG teams; (2) whether $1.5k/mo clears procurement without an annual contract; (3) Pro solo demand at $59 vs. team demand at $500+; (4) deep-dive turnaround the buyer will accept (Sales Plan says 5–10 business days).

---

## 4. Lead offers — the $10k/month math

Consistent with the Sales Plan's **primary segment (ESG / impact investors)**, the two recurring anchors carry the number:

### Lead Offer A — Institutional Data License (~$1,500/mo)
- **Math:** 3 licenses × $1,500/mo = **$4,500 MRR**
- Buyer: ESG team / asset manager monitoring healthcare, AI, or education exposure portfolio-wide.
- Why it leads: recurring, low-fulfillment once the export/API pipeline exists, and the natural "I need this for all my holdings, not one alert" upsell from Score-Watch. Anchors the sales call (Sales Plan §5 price-anchoring).

### Lead Offer B — Advisory Retainer (~$2,500/mo)
- **Math:** 2 retainers × $2,500/mo = **$5,000 MRR**
- Buyer: ESG/IR/foundation team wanting a named analyst, quarterly briefings, board-ready memos.
- Why it leads: highest ACV per deal, so it reaches the target with the *fewest transactions*, and it deepens the relationship that protects renewal.

### Combined: **$4,500 + $5,000 = $9,500 MRR from 5 deals.**

**Fewest-transactions variant (if advisory closes faster):** 4 retainers × $2,500 = **$10,000 MRR in 4 deals.** This is the minimum-transaction path and is the recommended primary target if early calls show appetite for interpretation over raw data. Conversely, if buyers want data-only, 7 licenses × $1,500 = $10,500 (more deals, lower touch each).

**Long-tail topping (no sales effort):** Score-Watch + Gumroad + Pro self-serve are expected to add $500–$2k/mo of unpredictable spill from the same outbound (Sales Plan lagging indicators). Treat as upside, not as part of the core $10k math.

---

## 5. Tier detail

### 5.0 Free funnel
- **What:** Free Score-Watch tier (watch a handful of entities, get notified on band crossings), the public Daily Briefing / digest, all 8 public index pages.
- **Buyer:** everyone — this is lead capture, not revenue. Email capture on Score-Watch free + briefing subscribe is the top of the funnel feeding §5.5/§5.6 outbound.
- **Billing:** $0. **Margin:** the research engine is a sunk cost that exists for the mission; marginal cost of serving a free user is ~zero (static export).
- **Guardrail:** public data is identical for everyone, including scored entities. A scored entity can read its own page but cannot change what it shows.
- **Buildable fast:** YES — exists today; only needs the email-capture loop tightened.

### 5.1 Self-serve index report (Gumroad)
- **What:** Downloadable structured report for one index (e.g. all 447 F500 scores + dimension breakdown).
- **Buyer:** individual researcher, student, analyst, reporter needing a one-off snapshot.
- **Price:** **$49 individual / $195 commercial-use.** One-time.
- **Margin:** ~95%, fully automated via Gumroad.
- **Guardrail:** snapshot of published data; no influence pathway.
- **Buildable fast:** YES — 5 of 8 Gumroad products already exist; remaining (US Cities, US States, Universities) need products created and `useGumroad` flipped in `site/src/data/gumroad.ts`.

### 5.2 Score-Watch Alert
- **What:** Email alert when a watched entity's score/band moves, with the evidence delta.
- **Buyer:** individual investor/analyst/reporter, 1–5 entities. Sales Plan's genuine self-serve entry ("start today, cancel anytime").
- **Price:** **$79/yr/entity.** Annual recurring.
- **Margin:** high once Gumroad product + Worker webhook are live; auto-fulfilled.
- **Guardrail:** reflects published score only; an entity cannot pay to suppress its own alert.
- **Buildable fast:** YES — one config flip (`SCORE_WATCH.useGumroad = true`) + Gumroad product (Sales Plan Fix 4 / PRD P0-A). **Currently routes to contact-sales — this is the single highest-leverage self-serve unblock.**

### 5.3 Pro subscription
- **What:** Enhanced daily briefing, multi-entity alerting, deeper data views, early access. The "I live in this data" tier below a full license.
- **Buyer:** active data journalist, solo analyst, researcher.
- **Price:** **$59/mo or $590/yr** solo (2 months free annual). **Pro Team (3–5 seats): $500–$1,000/mo [validate]** — this is where the Sales Plan's $500–1k band actually belongs.
- **Margin:** high; content already produced. Needs light access-gating.
- **Guardrail:** identical data for all subscribers; no entity-specific lever.
- **Buildable fast:** PARTIAL — needs auth/gating product work (currently `/api-access` routes to contact-sales). Solo Pro can launch on Gumroad recurring as an interim; gated data feed needs the Worker.

### 5.4 Custom deep-dive report
- **What:** One entity or sector across all 8 dimensions / 40 subdimensions with the full evidence trail; citable, methodology-backed.
- **Buyer:** fund preparing a position memo; newsroom launching a series.
- **Price:** **$3,500** one-time (range $2,500–$5,000 by scope/turnaround).
- **Margin:** 60–75% (analyst time is the cost). Delivered 5–10 business days.
- **Guardrail:** commissioned *by a data user about an entity*; the entity neither commissions nor approves it, and findings are not pre-shown to the entity for sign-off.
- **Buildable fast:** YES — pure services; reuses the `benchmark-research` pipeline. No product work.

### 5.5 Institutional Data License / feed — **LEAD OFFER A**
- **What:** Structured catalog access (all indexes, all entities, dimension-level) + daily deltas, as CSV/XLSX export and/or API/data feed.
- **Buyer:** ESG team, asset manager, portfolio-monitoring desk, healthcare/AI/education research team.
- **Price:** **$1,500/mo** entry (range $1–2k/mo); **$12,000–$20,000/yr** enterprise/multi-seat (aligns with existing `/data-licenses` tiers).
- **Billing:** monthly (fast close) or annual (enterprise PO).
- **Margin:** high after the export pipeline + API exist; per-client setup cost on the first few.
- **Guardrail:** grants access + defined usage rights ONLY; cannot alter inclusion, score, or rank (matches the `/data-licenses` "does not include" panel verbatim).
- **Buildable fast:** PARTIAL — CSV export of the catalog exists/can be generated fast (the `export-public-data.mjs` prebuild already emits per-entity JSON). A true **daily-delta API/feed** needs product work (versioned snapshots + delta endpoint). Sell the CSV+daily-email-delta version now; build the API for clients who require it.

### 5.6 Advisory / briefing retainer — **LEAD OFFER B**
- **What:** Named analyst on call; sector-specific monthly memo; quarterly briefing; board/IR/regulatory-prep support built on published findings.
- **Buyer:** ESG/IR/procurement/foundation team.
- **Price:** **$2,500/mo** (range $2–5k/mo), minimum 3-month term.
- **Billing:** monthly recurring.
- **Margin:** 50–65%; founder/analyst-time bound — caps at ~4–6 concurrent clients solo, which is *fine* because 4 of them = $10k.
- **Guardrail:** interprets published data **for the buyer (a data user)**. Explicitly does **not** advise a scored entity on how to raise its own score — that would convert advisory into pay-for-score and is prohibited.
- **Buildable fast:** YES — pure services. The `/advisory` page exists; needs pricing + booking link.

### 5.7 Certified Assessment (sold TO an entity) — **DE-EMPHASIZE**
- **What:** A formal, assessor-led evidence review of an entity, using the public methodology, producing findings + improvement guidance. The entity pays.
- **Independence-safe definition (already encoded on `/certified-assessments`):** payment buys the **assessment process, evidence review, and findings report ONLY**. It explicitly does **not** buy a target score, a rank change, a certification outcome, a public-listing decision, or suppression of public findings. The entity's public benchmark score is set by the independent pipeline regardless of whether it buys an assessment, and the assessment cannot feed back into the public score.
- **Why it is risky:** even with a clean definition, an entity paying Compassion Benchmark *anything* creates a perception that the benchmark can be influenced — which directly attacks the one asset the whole model sells (independence). The Grant-Funder Map raises the identical concern about funding from scored entities; the same logic applies to assessment fees. One careless headline ("UHG paid the benchmark that scores it") destroys investor trust worth far more than the assessment fee.
- **Recommendation:** **Keep available, do not promote.** Leave the `/certified-assessments` page live for inbound demand (genuine internal-governance buyers exist), but (a) keep it out of the primary pricing page and outbound, (b) require a written firewall acknowledgment in the contract, (c) publicly disclose every assessment client, and (d) **never** sell it to an entity currently in an active downgrade/watch state. If in doubt, decline. The $5–15k is not worth the brand risk versus the $10k/mo coming from data users.
- **Guardrail summary:** paid PROCESS, never a favorable OUTCOME; firewalled from the public score; publicly disclosed.

---

## 6. Pricing-page structure (replaces "contact sales")

Create `/pricing` as the single commercial hub (Sales Plan Fix 1). Three columns for the fast-money offers, a self-serve strip above, and a clear booking path. This replaces the vague "Contact sales" buttons currently scattered across `/data-licenses`, `/advisory`, `/api-access`.

### Layout

**Top strip — Self-serve (buy now, no call):**
| Free | Score-Watch | Index Report | Pro |
|---|---|---|---|
| $0 — alerts + daily briefing + public indexes | $79/yr/entity — alert on any watched entity | $49 / $195 — one-index download | $59/mo — daily depth + multi-entity alerts |
| **[Subscribe free]** | **[Add to watch — Gumroad]** | **[Buy on Gumroad]** | **[Start Pro — Gumroad]** |

**Main grid — Institutional (book a call):**
| **Data License** | **Custom Deep-Dive** | **Advisory Retainer** |
|---|---|---|
| **From $1,500/mo** (annual from $18k/yr) | **From $3,500** one-time | **From $2,500/mo** (3-mo min) |
| Full catalog + daily deltas, CSV/API, defined usage rights | One entity/sector, all 40 subdimensions + evidence trail, citable | Named analyst, monthly memo, quarterly briefing, board/IR prep |
| For ESG teams & portfolio monitoring | For position memos & newsroom series | For ongoing interpretation |
| **[Book a 20-min data walkthrough]** | **[Scope a report]** | **[Book a call]** |

**Enterprise footer:** "Multi-team, all-indexes, API, or custom scope? Enterprise agreements from $30k/yr." → **[Talk to us]** (preserves the existing `/data-licenses` enterprise + `/certified-assessments` advanced bands).

**Quiet footer link (not a column):** "Are you an institution seeking a formal internal assessment? Certified Assessments →" (the de-emphasized §5.7 path).

### Booking / checkout path
- **Self-serve tiers** → direct Gumroad checkout (one-time and recurring). Instant fulfillment.
- **Institutional tiers** → a single **Calendly/Cal.com "Book a 20-minute data walkthrough"** link (Sales Plan Fix 1 & 3), embedded on `/pricing` and in the nav, plus added as a P.S. to every outbound email. After the call: one-page scope doc → proposal → invoice (Stripe invoice or Gumroad for sub).
- **Track** (Sales Plan Fix 2 / Plausible): `pricing_page_view`, `booking_link_click`, `gumroad_outbound_click`.
- **Independence line on the page** (verbatim from Sales Plan §Independence Disclosure): "Entities never pay for inclusion, score changes, or suppression of findings. Commercial products are sold to data users, not to the entities being scored." This is a *selling point*, displayed prominently, not a buried disclaimer.

---

## 7. Monthly vs annual, discounts, upgrade path

### Monthly vs annual
- **Self-serve recurring (Score-Watch, Pro):** offer annual at ~2 months free ($590/yr Pro vs $708 monthly; Score-Watch is annual-only at $79).
- **Institutional (License, Advisory):** **lead with monthly** for fast first close (lower activation barrier), **steer to annual** for the discount + revenue predictability. Annual License $18k (≈ $1.5k/mo with no discount as the "default"; offer 10–15% off for annual prepay = ~$15.3–16.2k). Advisory: 3-month minimum, annual prepay 10% off.
- **Rationale:** monthly wins the first deal in 30 days; annual converts it to durable MRR by renewal. Don't force annual up front — the Sales Plan's whole thesis is fewest/fastest deals.

### Discounts (guardrail-safe)
- **Annual prepay:** 10–15% (standard).
- **Academic / nonprofit / small-newsroom:** 30–50% off self-serve and License — encouraged (mission-aligned, expands citation surface, low cost). Aligns with Grant-Funder Map's journalism/academic relationships.
- **Reference / case-study deal:** one early newsroom at break-even in exchange for public attribution (Sales Plan §1 — worth it for compounding inbound).
- **No discount is ever given to, or conditioned on, a scored entity.** Never discount in exchange for anything that touches a score.

### Free → paid upgrade path
```
Free briefing / public index  →  Score-Watch ($79/yr, 1 entity)
        ↓ (watching 5+ entities, wants the whole portfolio)
Pro ($59/mo)  →  Institutional Data License ($1,500/mo)
        ↓ (needs interpretation, not just data)
Advisory Retainer ($2,500/mo)
        ⤷ one-time spike at any stage: Custom Deep-Dive ($3,500)
```
The natural escalation is **entity-count and depth**: a buyer tracking one entity ($79) who starts tracking ten is over-paying on alerts and under-served — that is the trigger to pitch the License. A License buyer who keeps emailing "what does this mean for the quarter?" is the trigger to pitch Advisory.

---

## 8. Build-fast vs needs-product-work

| Offer | Status | What's needed |
|---|---|---|
| Free funnel | **Live** | Tighten email capture loop |
| Self-serve report | **Mostly live** | Create 3 missing Gumroad products; flip `useGumroad` |
| Score-Watch | **One config flip** | Gumroad product + `SCORE_WATCH.useGumroad = true` (highest leverage) |
| Custom deep-dive | **Buildable now** | Services only — no code |
| Advisory retainer | **Buildable now** | Services only — add pricing + booking link |
| Data License (CSV) | **Buildable now** | Catalog CSV export from existing prebuild + manual daily-delta email |
| Data License (API/feed) | **Needs product work** | Versioned snapshots + delta endpoint on the Worker |
| Pro (solo) | **Interim now / product later** | Gumroad recurring interim; gated feed needs auth |
| Pro Team / multi-seat | **Needs product work** | Seat management + auth |
| `/pricing` page + Calendly | **Buildable now** | Sales Plan Fix 1 & 3 — top Week-1 priority |
| Certified Assessment | **Live (de-emphasized)** | No build; tighten contract firewall language |

**Week-1 revenue-unblocking sequence (from Sales Plan §6):** (1) build `/pricing` with both monthly + annual framing and a Calendly link; (2) flip Score-Watch to Gumroad; (3) install Plausible with the 3 events; (4) generate the catalog CSV so a License can be fulfilled the day it's sold. None of the four lead-offer closes (License CSV, Advisory, Deep-Dive) require new product code — they can all be sold and fulfilled manually while the API is built.

---

## 9. Independence guardrails — consolidated

1. **All revenue is from data users**, never from scored entities for inclusion/score/suppression.
2. **The one entity-facing offer (Certified Assessment)** is a paid *process and report only*, firewalled from the public score, publicly disclosed, de-emphasized, and declined for any entity in active downgrade/watch.
3. **No discount, term, or deliverable** is ever conditioned on anything that touches a score.
4. **The independence statement is a selling point**, shown prominently on the pricing page and in every proposal (Sales Plan §Independence Disclosure).
5. **Commercial system is structurally separated** from the scoring pipeline at the code level (per CLAUDE.md independence policy) — preserve this separation in any pricing/checkout/auth code added.
6. **Funding independence (cross-ref Grant-Funder Map):** the same "no money from scored entities" logic governs grants; revenue and grants together must keep the benchmark single-ecosystem-independent.

---

*Prepared 2026-06-22. Prices are recommendations pending validation against the first 5 real quotes. Validate monthly-vs-annual acceptance, the $1.5k/mo procurement threshold, and solo-Pro demand before hard-coding any list price into the site.*
