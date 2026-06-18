# Revenue Review — Growth & Conversion
**Date:** 2026-05-28
**Author:** Growth Strategist agent
**Scope:** Acquisition / Activation / Conversion improvements only. No SKU redesign, no backend architecture.
**Sources read:** CLAUDE.md, GROWTH_STRATEGY_2026-05-27.md, PRICING_STRATEGY_2026-05-27.md, PRD_MONETIZATION_V2.md, QA_REPORT_MONETIZATION_V2.md, gumroad.ts, EntityDetail.tsx, NewsletterSignup.tsx, SCORE_WATCH_LAUNCH.md, LINKEDIN_UTM.md

---

## Candidate 1 — Unblock the Watcher Conversion Wall (Gumroad flip + broken URLs)

**Type:** Fix

**Problem:**
`SCORE_WATCH.useGumroad` is `false` (gumroad.ts:68). Every entity-page visitor who clicks "Subscribe — $79/yr" is routed to `/contact-sales` for manual fulfillment. The QA report (LB-1 through LB-5) confirms this is intentional pending Gumroad product creation, but the consequence is complete conversion wall on the highest-intent surface in the product. Additionally, `GUMROAD.briefingArchive`, `GUMROAD.observer`, `GUMROAD.usCitiesIndex`, and `GUMROAD.usStatesIndex` are all TODO placeholder strings (gumroad.ts:14–38), meaning live CTAs on `/pricing` already route to broken Gumroad 404s (DEFECT-008, QA report §2). The GROWTH_STRATEGY document explicitly labels this "P0: every day `useGumroad=false` is live is lost revenue" (growth doc §5). The SCORE_WATCH_LAUNCH content was already distributed in April 2026 — demand was seeded, but the purchase path is still broken.

**Proposed change:**
Phil creates four Gumroad products (Watcher $79, Observer $249, Briefing Archive $99, US Cities $149, US States $99) and pastes live URLs into gumroad.ts. Flip `SCORE_WATCH.useGumroad = true`. Fix DEFECT-001 price mismatches on `/purchase-research` (frontend engineer task, QA report LB-3). These are operational steps, not engineering work. This candidate is listed here because every other growth tactic is futile while the checkout path is broken.

**Expected revenue benefit:**
Funnel stage: Activation → Conversion (bottom of funnel). Any entity-page visitor with intent to pay currently converts at 0% because the manual-fulfillment path requires email exchange and a Stripe link. Even a 1% entity-page CTA → purchase rate on existing traffic produces the first revenue. This is the prerequisite for every downstream growth experiment — PRD goal 3 explicitly states "eliminate the conversion wall as Day 1 priority."

**Independence-policy check:** PASS. The Gumroad product is a notification convenience product. No score influence. Independence note is already in EntityDetail.tsx:467-469.

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

## Candidate 2 — Free Email Opt-in as Lead Capture Before Paid CTA

**Type:** Fix (gap in current build, not a new idea)

**Problem:**
The PRD (§3.4) designates the free email opt-in as "not a nice-to-have" and calls it "the single highest-priority conversion gap." The growth strategy (§2) frames it as "Critical leak — visitor leaves permanently" in the funnel table. Looking at the actual EntityDetail.tsx code, `EntityNewsletterCapture` is rendered twice: once above the Score-Watch CTA (line 393) and once inside the "Free weekly briefing" card (line 531). This looks complete. However, the same opt-in is absent from two other surfaces: (a) daily briefing pages at `/updates/[date]` (PRD §3.4 explicitly requires it there), and (b) the `/score-watch` marketing page (same requirement). The growth strategy also confirms the briefing page as a missing capture point (§5). The `NewsletterSignup` component exists and works (it has four variants including `inline` and `card`). The gap is purely in placement, not in the component itself.

Additionally, the post-subscribe success copy in NewsletterSignup.tsx:134 reads "score changes, sector trends, and emerging risks" — the QA report (DEFECT-004 residual) flags "emerging risks" as a judgment-call independence-policy item. This is the first message a free subscriber sees. It is the onboarding copy for the Score-Watch upgrade pipeline. If it triggers independence-policy concern, it undermines the trust that makes the upgrade email credible.

**Proposed change:**
(1) Add `<NewsletterSignup variant="card" source="briefing-page" />` to the daily briefing page template below briefing content. (2) Add the same component to the `/score-watch` marketing page as a free-tier fallback. (3) Revise success copy in NewsletterSignup.tsx:134 from "emerging risks" to "methodology updates" — same factual content, policy-clean language. These are low-effort component placements and one copy string change.

**Expected revenue benefit:**
Funnel stage: Acquisition → Activation. The briefing pages are the primary SEO surface (daily content, growing archive). Visitors landing on a briefing via Google or LinkedIn who find no email capture leave permanently. A 2–5% opt-in rate on briefing page visitors feeds the Score-Watch upgrade pipeline — the pricing strategy (§5) identifies newsletter subscribers as the highest-quality Watcher prospects with the lowest CAC. Every email captured here is a future $79/yr conversion candidate at near-$0 acquisition cost.

**Independence-policy check:** PASS. The newsletter is free; no commercial pressure on scoring. Copy fix removes the one flagged phrase.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **14** |

---

## Candidate 3 — Free→Paid Upgrade Email Sequence (Score-Watch Lifecycle)

**Type:** Improvement

**Problem:**
The growth strategy (§5) explicitly names the missing upgrade sequence: "No upgrade email sequence from free newsletter subscriber to Score-Watch paid. A visitor who joins the free digest is the highest-quality Score-Watch prospect — there is no trigger email that says 'the entity you signed up to watch just moved.'" The `EntityNewsletterCapture` component captures entity slug and entity name at signup (EntityDetail.tsx:393–395 passes these as props). The Listmonk infrastructure is live. But there is no documented trigger or template for the upgrade sequence. The SCORE_WATCH_LAUNCH newsletter blast (launched April 2026) is a one-time blast to the existing list — not a lifecycle sequence tied to entity behavior.

The pricing strategy (§5 retention section) also identifies a structural retention risk: if an entity never changes score, the subscriber has no activation event and churns at renewal. An upgrade email that connects "the entity you opted in about has just moved" to the Score-Watch CTA solves both the free→paid conversion gap and the subscriber activation problem simultaneously.

**Proposed change:**
Write a 3-email Listmonk sequence triggered from the entity-scoped opt-in:
- Email 1 (immediate): "You're watching [Entity Name] — here's its current score and what the benchmark measures." Welcome + methodology context. No paid CTA. Establishes trust.
- Email 2 (day 3 or on first score change, whichever comes first): "Since you started watching [Entity Name] — here's what moved." If no change in 3 days, send a "peer comparison" (how this entity ranks in its index). Soft Score-Watch CTA: "Get this in your inbox instantly, not in the weekly digest."
- Email 3 (day 14): "Your free watch period — one thing about [Entity Name] worth knowing." Score summary + direct Score-Watch upgrade CTA with price ($79/yr).

This requires only Listmonk template work and a Listmonk automation rule — no code changes.

**Expected revenue benefit:**
Funnel stage: Activation → Conversion. The pricing strategy estimates Score-Watch LTV at $130 (65% renewal × $79). If the free list grows to 200 subscribers from entity-page and briefing-page captures, and the upgrade sequence converts 5%, that is 10 paid Watcher subscribers ($790/yr run-rate) at CAC near $0. The sequence also serves as the primary retention mechanism before the first alert fires — addressing the "quiet entity" churn risk documented in the pricing strategy (§5 retention risks).

**Independence-policy check:** PASS. Email content uses only public benchmark data. No score prediction, no "risk alert" framing. Copy must avoid prohibited phrases — templates should be drafted against the prohibited language list in PRD §3.5 before deployment.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **14** |

---

## Candidate 4 — Observer Bundle Cross-Sell: Upgrade Prompt Timing and Copy

**Type:** Improvement

**Problem:**
The Observer bundle ($249/yr, 5 entities) is the highest single-transaction revenue item at MVP — it pays more than three Watcher subscriptions and targets the professional buyer the growth strategy (§7, channel-product fit matrix) identifies as having the lowest CAC via LinkedIn sector-trend posts. The current EntityDetail.tsx cross-sell (line 471–479) reads "Tracking more than one entity? Observer is coming next →" — which the QA report (DEFECT-003 fix note) confirms deviates from the PRD spec of "Observer — 5 entities, $249/yr." The copy omits the price and entity count, which are the two key decision signals for the multi-entity buyer. More critically, the cross-sell appears below the independence note — it is the last item in the CTA panel and is easy to miss. The pricing strategy (§4 Experiment 3) deliberately defers Observer visibility on entity pages until week 5, but that clock has passed (launch was April 2026).

**Proposed change:**
(1) Update the Observer cross-sell copy on entity pages from "Observer is coming next" to "Watching multiple entities? Observer covers 5 for $249/yr — save vs. 4 Watcher subscriptions." This is a one-line copy change. (2) Move the Observer cross-sell to immediately below the Watcher CTA button (before the independence note), where visual hierarchy is higher. (3) On the `/score-watch` page, add the explicit savings prompt the pricing strategy (§5 upgrade path mechanics) specifies: "You're spending $316/yr on 4 entities. Observer bundle covers 5 for $249/yr — save $67." This prompt should be visible on the page without requiring the buyer to be in mid-checkout.

**Expected revenue benefit:**
Funnel stage: Conversion → ACV expansion. A single Observer sale ($249) outperforms three individual Watcher sales in revenue per transaction. The target buyer — an ESG analyst tracking a peer group of 3–5 companies — is already arriving via LinkedIn sector-trend posts. The copy change from "coming next" to "save $67 vs. 4 individual subscriptions" provides the savings anchor that converts a multi-entity visitor who might otherwise buy one Watcher and stop. Observer LTV ($479 at 60% renewal) is 3.7x Watcher LTV ($130 at 65% renewal).

**Independence-policy check:** PASS. Observer is an observation product sold to third-party observers. The cross-sell framing is savings-based, not entity-reputation-based. No prohibited language involved.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **13** |

---

## Candidate 5 — Systematized "Mover of the Week" LinkedIn Distribution

**Type:** Experiment

**Problem:**
LinkedIn is the primary acquisition channel (GROWTH_STRATEGY §1, Rank 2). UTM tracking is live (LINKEDIN_UTM.md). The SCORE_WATCH_LAUNCH content demonstrates the format works — the Microsoft case study post is exactly the "entity moved, here's the evidence, here's what it means for your professional accountability" format the growth strategy identifies as the proven winner. But the growth strategy also notes the problem: LinkedIn posts are "episodic, not systematic." There is no documented cadence producing consistent 3–4 posts/week. Without consistent distribution, LinkedIn referral traffic is event-driven (spikes at launch, decays to near-zero between posts). The funnel cannot activate without top-of-funnel volume, and top-of-funnel volume on a static site with no paid acquisition requires consistent organic distribution.

The `utm_campaign=entity-spotlight` and `utm_campaign=sector-trend` values are already defined in LINKEDIN_UTM.md. The measurement infrastructure is in place. The distribution itself is not.

**Proposed change:**
Establish a fixed weekly production rule: every Monday, publish one "Mover of the Week" post using the Microsoft case study format — entity, starting position, what changed, evidence summary, what it means for the reader's professional accountability, Score-Watch or Index Snapshot CTA. Every Thursday, publish one sector-trend post ("AI labs this week," "Fortune 500 movers," etc.) drawn from the daily briefing archive. This is content policy, not engineering. The SCORE_WATCH_LAUNCH content package is the template. The daily briefing pipeline already produces the source material. The only required investment is 30–45 minutes of authorial work per post.

**Success metric:** LinkedIn sessions with `utm_source=linkedin` in Umami. Target: +50% LinkedIn referral sessions in weeks 5–10 vs. weeks 1–4 baseline (growth strategy Experiment 3 benchmark). Secondary: `score_watch_click` events traceable to `utm_campaign=entity-spotlight` within 7 days of post.

**Expected revenue benefit:**
Funnel stage: Acquisition → Activation. LinkedIn is the only traffic channel with documented conversion signal (score_watch_click events visible in Umami with utm attribution). Doubling LinkedIn referral sessions doubles the addressable activation pool for free opt-in → paid conversion. At the current conversion math in the growth strategy (Score-Watch CAC $15–30 via LinkedIn), consistent LinkedIn distribution is the lowest-cost paid-conversion channel available before SEO matures.

**Independence-policy check:** PASS. Posts report factual score changes with evidence. The format explicitly avoids editorial commentary beyond factual synthesis. The SCORE_WATCH_LAUNCH posts contain the correct independence disclaimer ("Entities never pay for inclusion, score changes, or suppression.").

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 3 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **12** |

---

## Candidate 6 — Briefing Archive Paywall as Active Conversion Trigger

**Type:** Experiment

**Problem:**
The Briefing Archive ($99/yr) is the second subscription product and the one with the clearest behavior-based trigger: a reader who lands on a briefing older than 14 days and hits the paywall is, by definition, a habitual reader who values the content enough to search for past issues. The PRD (§2 SKU 4) and QA report confirm the BriefingPaywall component is implemented (CLOSED, gap #9). However, the paywall is only a conversion mechanism if the reader reaches a gated page. Two gaps undercut this: (1) There is no active mechanism driving readers to gated pages — briefing-page traffic is organic/LinkedIn and skews toward recent briefings, which are free. (2) The briefing archive index page (`/updates/archive`) is not confirmed to have a newsletter capture or upgrade CTA that would convert browsing archive visitors before they hit a paywall they weren't expecting.

The growth strategy (§3) recommends the "Monthly Sector Digest" as an email-gated free asset that feeds the subscriber list — which then creates the archive-reading behavior that generates paywall hits. Without the digest or a similar content hook, the archive paywall is a passive gate with no active funnel feeding it.

**Proposed change:**
(a) In the monthly newsletter (the weekly digest format that already exists), include one link per month to a briefing from 30+ days ago with the framing "This month's most significant score change — full record in the archive." This actively drives existing newsletter subscribers to gated pages and creates measurable paywall hit events (`archive_paywall_hit` Umami event). (b) Add a "Briefing Archive — $99/yr" CTA card to the `/updates` archive index page for visitors browsing the archive listing. This is a one-paragraph copy addition. (c) Confirm GUMROAD.briefingArchive URL is live (LB-2 from QA report) before either of the above drives traffic to the paywall.

**Expected revenue benefit:**
Funnel stage: Activation → Conversion. The PRD target is 10 archive subscribers in 90 days post-launch ($82/mo run-rate). The paywall only converts if readers reach gated pages. Driving 5% of the existing newsletter list (assumed 200+ subscribers) to a gated page each month creates 10+ paywall hits per month, with a target paywall-to-subscribe rate of 8% (PRD §6 SKU 4 metric). That math produces approximately 1 new subscriber per month from list-driven traffic alone — at zero CAC.

**Independence-policy check:** PASS. Archive is historical record; access pricing does not involve score influence. The editorial link in the newsletter reports factual past events.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 3 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **11** |

---

## Priority Summary

| Rank | Candidate | Score | Type |
|---|---|---|---|
| 1 | Unblock the Watcher conversion wall | 16 | Fix |
| 2 | Free email opt-in on briefing pages + copy fix | 14 | Fix |
| 2 | Free→paid upgrade email sequence | 14 | Improvement |
| 4 | Observer cross-sell copy and positioning | 13 | Improvement |
| 5 | Systematized LinkedIn distribution | 12 | Experiment |
| 6 | Briefing archive paywall activation | 11 | Experiment |

---

## Sequencing Note

Candidates 1 and 2 are prerequisites for every other candidate. Without a working checkout (Candidate 1), no conversion experiment is measurable. Without email capture on briefing pages (Candidate 2), the upgrade sequence (Candidate 3) has no list to run on. The recommended execution order is: 1 → 2 → 3 → 4 in parallel with 5 → 6.

---

*Growth Strategist agent | 2026-05-28 | Downstream: coordinator, analytics, product-manager*
