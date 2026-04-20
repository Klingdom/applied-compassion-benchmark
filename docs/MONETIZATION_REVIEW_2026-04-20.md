# Monetization Review — Compassion Benchmark
**Date:** 2026-04-20  
**Author:** Growth Strategist  
**Constraint:** Independence policy is non-negotiable throughout. Every recommendation preserves the rule that entities never pay for inclusion, score changes, or suppression.

---

## 1. Current State Map

| Surface | Price | Fulfillment | Live? | Demand evidence |
|---|---|---|---|---|
| Index PDF reports (5 Gumroad products) | $195 each | Instant / Gumroad self-serve | Live | No sales data visible in repo; Gumroad URLs exist and are wired to configurator |
| Score-Watch Alert (per entity) | $79/yr | Manual — contact-sales form → Phil sends Stripe link or invoice | Soft-launch today | Zero closed subscriptions as of this writing; first inbound expected Monday |
| Annual All-Indexes Bundle | $1,250+ | Contact sales (quote) | Paper product | No closed deals confirmed |
| Index Report + Data Appendix | $295–$750 | Contact sales | Paper product | No closed deals confirmed |
| Institutional Research Pack | $1,500–$5,000 | Contact sales | Paper product | No closed deals confirmed |
| Research Deck Package | $2,500+ | Contact sales | Paper product | No closed deals confirmed |
| Custom Research Package | Custom | Contact sales | Paper product | No closed deals confirmed |
| Data Licenses (Rankings Table, Dimension-Level, Annual Bundle, Institutional, Academic, Enterprise) | $500 – $20,000+ | Contact sales | Paper product | No closed deals confirmed |
| Advisory (Briefing, Memo, Workshop, Roadmap) | $1,500 – custom | Contact sales | Paper product | No closed deals confirmed |
| Certified Assessments | $2,500+ | Contact sales | Paper product | No closed deals confirmed |
| Enterprise Agreements | $10,000 – $250,000+ | Contact sales | Paper product | No closed deals confirmed |
| AI Evaluation Suite | Not priced on page | Contact sales | Paper product | No closed deals confirmed |
| Prompting Suite for Humans | Not priced on page | Contact sales | Paper product | No closed deals confirmed |

**Honest summary:** Two real SKUs exist. The $195 PDF reports are self-serve and live. Score-Watch is wired but on manual fulfillment with no closed sales yet. Everything else is aspirational catalog — well-written pages with no closed revenue behind them. The review below prioritizes closing actual revenue in 90 days rather than optimizing the paper products.

---

## 2. Pricing Diagnosis

### $195 — Index PDF Reports
**Shape:** Right unit (flat per-report, self-serve).  
**Level:** Probably slightly low but defensible for launch. ESG data reports at this coverage depth (193 countries, 447 companies) from established publishers sell for $300–$2,500+ (to be verified against Bloomberg, Sustainalytics, MSCI — assumption). At $195, the price removes friction on a first purchase and anchors future upsells. The risk is not leaving money on the table here — it is failing to convert any of those $195 buyers into Score-Watch or data-license customers.  
**Verdict:** Hold at $195 for 90 days. Do not raise until you have 10+ data points on buyer identity and intent.

### $79/yr/entity — Score-Watch
**Shape:** Problematic unit. Per-entity annual pricing makes sense for someone tracking one or two entities; it creates a confusing UX friction point for anyone tracking a portfolio (an investor tracking 15 F500 names would need to do 15 separate transactions). The per-entity model is also an anchoring price, not a discovered number — there is no stated rationale for $79 in the codebase.  
**Willingness to pay:** The stated buyer archetypes (investors, compliance officers, policy analysts, communications leads) are professional users on expense accounts. A compliance officer at a mid-size asset manager tracking 10 portfolio companies would pay $790/yr for this. That same buyer would also consider Bloomberg Terminal alerts at $24,000/yr as the alternative — meaning $79/entity has enormous headroom.  
**Wrong-shaped how:** The current model rewards casual single-entity buyers and under-charges bulk professional buyers. An investor watching 20 names pays $1,580/yr; they would happily pay $299–$499/yr for a "watchlist" product covering the same names.  
**Verdict:** Keep $79/entity as the entry point. Add a multi-entity tier immediately (see Section 3).

### Premium research / enterprise / advisory
**Shape:** Not wrong — these are legitimately quote-driven products. But they are not real products yet; they are category placeholders. No pricing fix matters until the first deal closes.  
**Verdict:** Deprioritize pricing optimization on these. Focus on closing one deal in each category to establish a real number, then tune.

---

## 3. Packaging Gaps

### Gaps that map directly to 90-day revenue opportunity:

**A. Watchlist bundle — does not exist**  
The single biggest gap. An investor or analyst tracking a portfolio of entities needs one subscription covering N entities, not N separate sign-up flows. A "Watchlist — up to 10 entities" bundle at $499/yr and "Watchlist — up to 25 entities" at $999/yr would (a) increase ARPU on professional buyers, (b) reduce manual fulfillment overhead vs. 10 separate $79 transactions, and (c) create a natural expansion lever.

**B. Index-wide monitoring — does not exist**  
"Watch all 447 Fortune 500 companies" as a single subscription. Buyer: ESG research teams, media organizations, governance-focused investors who need any significant movement across an index. Price: $1,500–$3,000/yr per index, $5,000–$8,000/yr for all-index monitoring. This is a data-license-adjacent product; independence policy is cleanly maintained because the subscription still only observes.

**C. Competitive set — does not exist**  
"Watch [Company X] + its 5 closest benchmark peers." This is the most natural use case for a communications lead or investor — they want to know how their entity moves relative to a defined peer group, not in isolation. Could be priced at $299–$499/yr. Fulfillment is initially manual (Phil configures the peer group); later it becomes a UI feature.

**D. Quarterly research briefing — does not exist as a product**  
The research pipeline produces material changes continuously (CHANGELOG shows 14 significant moves in a single day, 222 band changes from one methodology update). A structured quarterly briefing — "What moved in the Fortune 500 this quarter, who were the biggest movers, what evidence drove it" — sold as a subscription at $199–$499/yr per index is a natural companion to the one-time PDF report. It also gives the $195 PDF buyer a reason to re-engage every 90 days.

**E. API access — acknowledged in expansion plans but absent**  
Data-licenses page mentions "API-based enterprise access" as a future expansion path. This is correct sequencing — do not build the API in 90 days. Note it exists as intent, not a gap to close now.

**F. White-label embed — not worth 90-day investment**  
Interesting long-term product but requires development and custom legal terms. Out of scope for this cycle.

---

## 4. Revenue-Per-Visitor Model — Funnel Leaks

Assumption: site traffic is small and early-stage — verify in Umami. The launch content going out today is the first significant distribution event.

**Leak 1 — No Score-Watch CTA on individual entity pages (or no upsell from data-license/research-pack pages to Score-Watch)**  
The Score-Watch page describes subscribing "from the entity page" (see score-watch/page.tsx Step 2). But the data-licenses page and purchase-research page have zero Score-Watch CTAs. A visitor who lands on the Fortune 500 data license page and decides not to spend $500–$2,500 today has no obvious lower-commitment alternative shown to them. A Score-Watch callout ("Not ready for a data license? Watch one entity for $79/yr") on the data-licenses page would capture the downgrade.

**Leak 2 — Research configurator routes non-self-serve selections to contact-sales with no price anchoring**  
The configurator (ResearchConfigurator.tsx) correctly routes complex configurations to contact-sales. But it shows no price on the contact-sales path — the buyer sees "Request quote" with no number. This is a conversion killer for buyers who are price-sensitive and just want to know if it's in budget. Adding "Starting at $295" to the contact-sales CTA for the appendix tier, and "Starting at $1,500" for institutional, would reduce abandonment.

**Leak 3 — No email capture on any page**  
There is currently no newsletter signup, no waitlist, no lead capture anywhere in the site. Every visitor who leaves without buying is permanently lost. The Score-Watch launch newsletter implies there is a list — but there is no mechanism shown in the codebase for new visitors to join it. A "Get score movement alerts by index" email opt-in (free tier: weekly digest of significant band changes) would (a) build the list and (b) create a natural upgrade path to paid Score-Watch alerts. This is the single highest-leverage funnel addition available.

---

## 5. Ranked 90-Day Recommendations

Scoring: **Impact** = effect on MRR/ARR (1–5). **Effort** = implementation cost (1=trivial, 5=significant). **Risk** = independence policy risk (0=none, 1=low/discuss, 2=careful). **Confidence** = how sure we are this works (1–5). **Priority** = (Impact × Confidence) / Effort.

| # | Move | Impact | Effort | Risk | Confidence | Priority |
|---|---|---|---|---|---|---|
| 1 | Add email capture / free digest signup to site | 5 | 2 | 0 | 5 | 12.5 |
| 2 | Create Gumroad product for Score-Watch and flip `useGumroad: true` | 4 | 1 | 0 | 5 | 20.0 |
| 3 | Add Score-Watch upsell CTA to data-licenses page and purchase-research page | 3 | 1 | 0 | 5 | 15.0 |
| 4 | Build and price "Watchlist bundle" (10-entity, 25-entity tiers) | 4 | 2 | 0 | 4 | 8.0 |
| 5 | Add price anchoring to contact-sales configurator output ("Starting at $295") | 2 | 1 | 0 | 4 | 8.0 |
| 6 | Publish quarterly research briefing as a product ($199–$499/yr per index) | 3 | 2 | 0 | 3 | 4.5 |
| 7 | Add "Competitive set" Score-Watch product (entity + 5 peers at one price) | 3 | 2 | 0 | 3 | 4.5 |
| 8 | Add index-wide monitoring product (all-F500 or all-countries alert subscription) | 4 | 3 | 0 | 3 | 4.0 |
| 9 | Close first advisory deal (interpretive briefing at $1,500–$3,500) | 4 | 2 | 0 | 2 | 4.0 |
| 10 | Add US States and US Cities to self-serve Gumroad (currently "request report" only) | 2 | 2 | 0 | 4 | 4.0 |

### Top 3 expanded:

**#1 — Email capture / free digest signup**  
Zero independence risk. A free "weekly band-change digest" opt-in does not affect scoring. It builds the list that Score-Watch converts from. Without this, every inbound visitor from Monday's launch is a one-shot interaction. Implementation: a simple inline form routed to an email provider (Mailchimp, ConvertKit, etc.). The form copy should be specific: "Get notified when significant score changes are published. One email per week, index of your choice. Free." Do not make this generic. Effort: 2 days.

**#2 — Create Score-Watch Gumroad product and flip the flag**  
Currently every Score-Watch inquiry requires manual intervention from Phil. The contact-sales flow is a conversion friction point for buyers ready to pay $79 without a conversation. Gumroad product creation takes under an hour. Once `useGumroad: true` in gumroad.ts, the entity pages and Score-Watch page auto-route to checkout. This is the fastest dollars-per-hour change in the list. The manual fulfillment pipeline (SCORE_WATCH_LAUNCH.md follow-up email) remains valid for multi-entity inquiries.

**#3 — Score-Watch upsell on data-licenses and purchase-research pages**  
Both pages end with CTA callouts to contact-sales. Neither mentions Score-Watch. A one-line callout ("Prefer ongoing monitoring over a static dataset? Score-Watch Alerts track a single entity for $79/yr.") with a link to /score-watch captures visitors who are interested but not ready for a $500+ data license. Effort: 30 minutes of copy + 1 component addition per page.

---

## 6. Pricing Experiments to Run in the Next 2 Weeks

These require no significant dev. They are sequential tests (not true A/B — traffic is too small for statistical significance) to gather directional signal.

**Test 1 — Score-Watch: annual vs. quarterly pricing**  
Hypothesis: Some buyers resist $79 upfront but would pay $24.99/quarter (= $99.96/yr, higher ARPU). Run the annual price for the first 30 days, then offer an optional quarterly toggle on the page for 30 days. Compare conversion rates and ARPU. Watch for: quarterly buyers who churn at month 3 before providing meaningful data.  
What to measure: sign-up count and total ARR per cohort.

**Test 2 — Watchlist bundle threshold: 5 vs. 10 entities as the first tier**  
Before building a full multi-entity UI, offer the bundle via the existing contact-sales form with two explicit price options in the email follow-up: "5 entities for $299/yr" vs. "10 entities for $499/yr." Measure which option buyers select when given a choice. This determines whether the natural portfolio size is small (5) or medium (10), which shapes the permanent product tiers.

**Test 3 — Research report price point: $195 vs. $249**  
Raise the Gumroad price on one index (e.g., AI Labs — smallest, most topical audience) to $249 for 30 days. If conversion rate holds, apply to all five. If it drops materially, revert. AI Labs is the right test index because AI governance buyers are professionals with expense accounts; they are least price-sensitive among the five cohorts.

---

## 7. What Not to Do

**Do not offer "featured" placement, score previews, or early-access alerts to paying subscribers.**  
These would directly violate the independence policy. Score-Watch explicitly states "the subscription does not affect the score." Any product that gives paying subscribers information about scores before public publication would compromise the policy.

**Do not create a "verified by Compassion Benchmark" badge that entities can purchase.**  
The certified-assessments page correctly positions this as a process product. Any badge, seal, or certification that could be construed as a paid endorsement of public scores would destroy the benchmark's credibility. If certified assessments are built out, they must be clearly described as internal process reviews, not public rating changes.

**Do not launch performance-based advisory pricing (e.g., "score improvement fees").**  
Advisory services that charge based on score outcomes would create a direct conflict with the independence of the published benchmark. Flat-fee or time-based advisory pricing only.

**Do not raise Index PDF prices above $295 in the next 90 days without closed sales data.**  
The current $195 price is below market but the market is unproven. Price increases on untested products with no demand evidence are guesses, not strategy. Get 10 sales first.

**Do not build a subscription tier that promises "influence on the research agenda."**  
Tiered access to methodology discussions, suggested entity additions, or assessment priority — even if framed as advisory input — risks the appearance that commercial relationships shape what gets scored. This pattern is common in ESG data businesses and is exactly what destroys their credibility. Keep the commercial and editorial pipelines fully separate.

**Do not invest development time in API access in the next 90 days.**  
API access requires auth infrastructure, rate limiting, versioning, and support. It is the right long-term product. It is not a 90-day move for a site at this stage of revenue.

---

*All traffic volume assumptions ("first inbound traffic Monday," early-stage site) are based on SCORE_WATCH_LAUNCH.md context. Verify actual session counts in Umami before sizing experiment sample sizes. Competitor pricing claims (Bloomberg Terminal, Sustainalytics) are flagged as assumptions requiring market-research verification.*
