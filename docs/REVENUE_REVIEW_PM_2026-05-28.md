# Revenue Review — Monetization Model
**Date:** 2026-05-28
**Author:** Product Manager agent
**Scope:** Packaging, pricing, tiering, free-to-paid path, B2B packaging, SKU-to-WTP alignment
**Does not cover:** Engineering tasks, marketing campaigns
**Independence policy status:** Every candidate below has been tested against the firewall. Candidates that fail are excluded before numbering.

---

## Context and Grounding

The current V2 model is 4 SKUs at launch (Watcher $79/yr, Observer $249/yr, Briefing Archive $99/yr, Index Snapshot $99–$195 one-time), blocked on Gumroad provisioning and KV namespace setup (QA Report LB-1 through LB-5). The model is substantially correct. The candidates below do not replace it — they identify gaps within it and realistic next moves that sharpen willingness-to-pay alignment.

All evidence citations reference docs read for this review.

---

## Candidate 1 — Close the gap between Observer ($249) and Analyst ($999): introduce a $499/yr "Analyst Lite" mid-tier

**Type:** new-SKU

**Problem:**
The pricing ladder jumps from Observer at $249/yr (5 entities, 1 seat) to Analyst at $999/yr (25 entities, 2 seats, briefing archive included) — a 4x price step with no intermediate rung. The Pricing Strategy (§2, Tier Ladder) documents this gap but offers no bridge product. The MARKET_MONETIZATION doc (§2, Pattern 2) identifies the portfolio-watchlist bundle as the highest-revenue opportunity, specifically calling out buy-side analysts and ESG research teams at mid-size funds as the ICP. These buyers likely watch 8–15 entities, not 5 and not 25 — their natural home is a tier that does not exist.

Evidence: PRICING_STRATEGY §2 shows Observer hard-capped at 5 entities and Analyst at 25 with no in-between. MARKET_MONETIZATION §5 ranks portfolio/watchlist bundle as the #1 revenue vector. GROWTH_STRATEGY §7 estimates 50 portfolio subscribers averaging $600/yr = $30K ARR — the $600 midpoint lands between Observer ($249) and Analyst ($999), implying the natural market price is a mid-tier that does not yet exist.

**Proposed change:**
Add a Phase 2 SKU: "Analyst Lite" at $499/yr. Entitlements: 15 entities across any combination of indexes, single email recipient, all Watcher alert features, no briefing archive, no sector digest, 2 entity swaps per quarter (vs. 1 for Observer). This creates a credible upgrade trigger for Observer subscribers who hit the 5-entity ceiling but cannot justify $999/yr. The full Analyst tier ($999) remains the step to 25 entities + briefing archive.

**Expected revenue benefit:**
The primary segment is ESG analysts at small-to-mid funds ($50M–$5B AUM) and compliance officers at mid-size enterprises. These buyers watch 8–15 entities and are currently either (a) buying multiple Observer subscriptions and hitting the same-index restriction, or (b) going to Analyst at $999 and using only 7 of 25 slots. A $499 mid-tier converts the first group cleanly and reduces buyer regret on over-purchase. Conservative projection: if 20 Analyst Lite subscribers are added by Day 90 post-Phase 2, incremental ARR = $9,980/yr. The more significant effect is ACV lift from Observer ($249) to Analyst Lite ($499) for upgraders — each upgrade adds $250/yr per subscriber.

**Independence-policy check:** PASS. Alert still fires on research pipeline output only. Observer-framing constraint (no entity-self-monitoring) applies identically. No score influence mechanism introduced.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **11** |

---

## Candidate 2 — Enforce the free-to-paid email capture path before any paid SKU goes live

**Type:** fix

**Problem:**
The free weekly digest opt-in on entity pages, briefing pages, and the /score-watch page is documented as "the single highest-priority conversion gap" in PRD_MONETIZATION_V2 §3.4 and again in GROWTH_STRATEGY §1 (Rank 3, Newsletter): "The subscriber list is the Score-Watch renewal base; every lost email address is a lost $79/yr renewal." Despite this, the free opt-in is treated in the current build state as one of several parity items rather than a conversion precondition.

The QA Report does not flag the free opt-in as a launch blocker, which means it could ship after the paid CTAs are live. This sequencing is wrong. Visitors who land on entity pages via LinkedIn or search and do not immediately buy are permanently lost if there is no free capture. These visitors are the highest-quality upgrade prospects — they already have demonstrated intent (they sought out a specific entity). Launching paid SKUs without the free capture is building a leaky bucket, as PRD §3.4 explicitly states.

Evidence: PRD_MONETIZATION_V2 §3.4 — "Shipping paid SKUs without this is building a leaky bucket." GROWTH_STRATEGY §2 activation funnel — "No free capture on entity pages currently — Critical leak." GROWTH_STRATEGY §5 — lists free opt-in as the single highest-priority missing conversion path. gumroad.ts confirms `SCORE_WATCH.useGumroad = false` and the Gumroad URLs are TODO placeholders — but the free opt-in (Listmonk) is also not confirmed as live on entity pages from the QA evidence.

**Proposed change:**
Gate launch of Watcher and Observer paid CTAs on confirmed live free opt-in. The acceptance criterion is: inline email capture form is present and functional on (a) entity detail pages above the Score-Watch CTA, (b) daily briefing pages below the briefing content, and (c) the /score-watch marketing page. The form posts to Listmonk's subscribe API, shows an inline confirmation on success, and does not redirect. This is not a new product — it is a precondition on the existing MVP.

**Expected revenue benefit:**
The mechanism is indirect but high-confidence. Email list subscribers from entity pages convert to Score-Watch at a materially higher rate than cold CTAs because they have intent signal. The GROWTH_STRATEGY §6 (Experiment 2) estimates 50+ new subscribers/month from this capture. At a 5–10% upgrade rate over 12 months, 600 captured emails = 30–60 Score-Watch conversions = $2,370–$4,740 in incremental Year 1 revenue from a path that otherwise yields $0. The renewal base effect compounds: list subscribers who receive "your entity moved" alerts before they purchase are the most reliable renewers.

**Independence-policy check:** PASS. Free email capture has no connection to score output or entity inclusion. The newsletter is a delivery mechanism for existing public data.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **15** |

---

## Candidate 3 — Add a Team license tier to Index Snapshots at checkout, not in Phase 2

**Type:** improvement

**Problem:**
Index Snapshots are currently single-user only ($99–$195). Team licenses ($249–$449) are deferred to Phase 2, gated on 10 individual purchases (PRD_MONETIZATION_V2 §4, Phase 2 table). This deferral assumes that individual buyers are the only segment at launch — but the ICP for Index Snapshots includes compliance teams and ESG research teams at small funds (PRICING_STRATEGY §3A). These buyers purchase for team use and will not buy an individual license if the license terms explicitly prohibit redistribution to colleagues.

The practical effect of launching individual-only is that institutional buyers who could pay $349 for a team license either (a) do not buy at all because the license scope is too narrow for their actual use case, or (b) buy individual and redistribute internally — violating the terms and creating a customer relationship problem at renewal. Neither outcome is good.

Evidence: PRICING_STRATEGY §3A documents team license prices already ($349 Fortune 500, $449 AI Labs). The Phase 2 gate in PRD §4 says "10 individual Index Snapshot purchases across any index" triggers team SKU. But if team buyers are in the launch audience, waiting for 10 individual purchases means waiting for the wrong buyer behavior to accumulate before serving the right one.

**Proposed change:**
Launch team license Gumroad products simultaneously with individual licenses, at the prices already specified in PRICING_STRATEGY §3A. The team license is a separate Gumroad product with different license terms — it does not require new engineering. The only addition is: on the /purchase-research and /pricing pages, below each individual index card, add a single line: "For team use (up to 10 users at one organization) — $349." This is a copy and Gumroad product creation change only. No architecture change, no new infrastructure, no Phase 2 dependency.

Remove the "10 individual purchases" trigger condition for team SKU and replace it with "team SKU available at launch as a separate Gumroad product alongside individual." Keep the Phase 2 trigger for the Index Snapshot Team marketing page expansion (more prominent placement, case studies) — but the product itself should exist at launch.

**Expected revenue benefit:**
A single compliance team or ESG research team buying the AI Labs team license at $449 generates more revenue than three individual AI Labs purchases at $195 each. The segment (small-to-mid fund compliance teams, NGO research teams, policy shops) is exactly the buyer who shows up for Index Snapshots in bulk. Estimate: if 3 of the first 15 Index Snapshot sales are team licenses instead of individual (replacing $195 individual purchases with $349–$449 team purchases), incremental revenue per cohort = $462–$762 on the same 15 conversions. Compounding: team license buyers are more likely to renew or upgrade to Analyst tier than individual buyers.

**Independence-policy check:** PASS. Team license expands use rights for the same historical data. No score influence possible. License terms explicitly bar redistribution to third parties and bar any claim of editorial influence.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **11** |

---

## Candidate 4 — Reframe Briefing Archive as a standalone product with its own marketing page, not an anchor on /pricing

**Type:** improvement

**Problem:**
The Briefing Archive ($99/yr) currently has no dedicated marketing page (QA Report Gap #8 — OPEN: "/briefing-archive marketing page does not exist"). Its CTA is anchored at `/pricing#briefing-archive` and is linked from the paywall on gated `/updates` pages. This means the conversion path for Briefing Archive is: (1) arrive at a daily briefing via search or link, (2) hit paywall, (3) click subscribe CTA, (4) land on Gumroad.

This path skips the value proposition entirely. A cold visitor hitting a paywall has not been shown why the archive is worth $99/yr — what the archive contains, how much history is accessible, what a journalist or researcher would use it for. The paywall is a demand-destruction event for this SKU without a value-anchoring page upstream.

Evidence: QA Report Gap #8 — marketing page is OPEN and absent. PRD_MONETIZATION_V2 §2 SKU 4 specifies the ICP as "a journalist or policy analyst who reads the daily briefing regularly and wants to search past events" — this is a regular reader, not a cold visitor, but a cold visitor from Google (who lands on a 30-day-old briefing via search) is also in the funnel and has no idea what the product is before hitting the paywall.

**Proposed change:**
Create `/briefing-archive` as a marketing page (this is already a noted gap in the QA Report). Content: value proposition for the archive ("12 months of daily score-movement intelligence across 1,155 entities, searchable"), a sample of what the archive contains (3–5 example briefing headlines with dates), the free window explanation ("Last 14 days always free"), and the subscribe CTA. The page must be linked from: the Briefing Archive paywall overlay, the /pricing page (already linked to `/pricing#briefing-archive` anchor — this can remain as secondary; a direct `/briefing-archive` page is the primary), and the site navigation (low-priority placement, probably under "Research" not top-level nav).

This is not a new product — it is a missing discovery and conversion surface for an existing SKU.

**Expected revenue benefit:**
Briefing Archive has the lowest confidence conversion path of the 4 MVP SKUs because it relies entirely on paywall-hit conversion. A dedicated marketing page introduces the product to visitors who are not yet at the paywall — researchers browsing the site, visitors from the Methodology page, newsletter subscribers who do not yet know the archive exists. Even modest improvement: if the page generates 20 additional archive page views per week from non-paywall paths and converts at 2%, that is 0.4 additional subscribers/week or roughly 20 incremental subscribers in the first 90 days at $99/yr = $1,980 incremental ARR. The ceiling scales with organic search on "compassion benchmark daily briefing" and "institutional score changes archive" queries.

**Independence-policy check:** PASS. The Briefing Archive is historical public data with time-gated access. No score influence mechanism. The archive is a delivery format, not a research output.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **11** |

---

## Candidate 5 — Add a "quiet entity" annual summary email to defend Watcher renewal

**Type:** improvement

**Problem:**
The Watcher churn risk documented in PRD_MONETIZATION_V2 §7 and PRICING_STRATEGY §5 is the "single-event-and-out" pattern: subscriber buys Score-Watch, entity never changes score in 12 months, subscriber cancels at renewal because they received zero alerts. The mitigation documented in the PRD is a one-line welcome email caveat ("stability is itself a signal") and a vaguely mentioned "no movement" annual summary email. But neither the PRD nor any downstream spec defines what that summary email contains, when it fires, or who owns it.

This is a retention gap masquerading as a documentation gap. Without a concrete product spec for the quiet-entity retention email, it will not be built. Score-Watch renewal rate is targeted at 65% (PRD §6 SKU 1 metrics). At $79/entity/yr, each churned subscriber after year 1 is $79 lost. If 30% of Watcher subscribers are on entities that have no score change in 12 months (plausible — benchmark entities do not move frequently), and all of them churn at renewal, the renewal rate ceiling is 70% regardless of product quality.

Evidence: PRD_MONETIZATION_V2 §7 Risk table row "Refund storm on Watcher." PRICING_STRATEGY §5 Retention risk table row "Single-event-and-out." PRICING_STRATEGY §5 metric table row "'Quiet entity' churn rate" — explicitly noted as "Measure and establish baseline" with no current mitigation built.

**Proposed change:**
Specify and ship a "Quiet Entity Annual Review" email. Fires 30 days before Watcher subscription renewal for any subscriber whose entity has had zero score change alerts in the prior 11 months. Content: (1) entity name and current composite score, (2) a one-sentence "stability summary" — "Entity X has held its score within 1.2 points over the past 12 months, placing it in the top quartile of [Index] for score consistency," (3) a brief comparison — "Of the 447 Fortune 500 companies tracked, 143 had score changes this year. Entity X was not one of them," (4) the upcoming renewal date and amount, (5) a link to the entity detail page showing the full 12-month history. This email reframes a zero-alert year as a credible data point, not a failed product. It is triggered by the same nightly pipeline that already tracks subscriber records — the firing condition is `active === true && expires_at within 30 days && zero alerts delivered in past 335 days`.

**Expected revenue benefit:**
If the quiet-entity retention email saves 20% of quiet-entity churners at renewal — that is, converts 20% of subscribers who would have cancelled into renewals — the math at launch scale is modest but compounds. Assuming 25 Watcher subscribers, 30% quiet-entity rate = 7–8 quiet subscribers at renewal. Saving 20% = 1–2 renewals saved = $79–$158 recovered. At 250 subscribers (Phase 2 scale), same math = 15–16 renewals saved = $1,185–$1,264/yr. More importantly, this is a trust signal: the email demonstrates the product is monitoring actively even in quiet periods, which is exactly the value proposition ("stability is a signal"). This reduces the perceived risk of subscription for new buyers who wonder "what if nothing happens."

**Independence-policy check:** PASS. The annual summary email is derived entirely from the research pipeline's recorded (or absence of recorded) change proposals. No score influence. The framing "stability is a signal" is accurate and does not editorialize on the entity's standing — it reports a factual observation.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **13** |

---

## Candidate 6 — Add a Researcher Data License ($249/yr) at Phase 2 launch, not Phase 3

**Type:** improvement

**Problem:**
The Researcher Data License ($249/yr, non-commercial JSON/CSV export of all 7 indexes, quarterly updates) is currently listed as Phase 2 in the PRD (§4) with a trigger condition of "first academic citation OR 15 Index Snapshot sales." MARKET_MONETIZATION §5 ranks this #5 in revenue vectors but notes the downstream value as "Large in citation pipeline driving enterprise." PRICING_STRATEGY §3D defines the product completely — terms, price, ICP, phase.

The problem with the Phase 2 trigger condition is that the primary value of this SKU is not direct revenue — it is academic citation, which drives institutional buyer awareness, which is the enterprise pipeline. Academic citations take 6–18 months from researcher access to published paper. Waiting for the trigger condition (15 Index Snapshot sales) before launching means delaying the citation pipeline by 3–6 months relative to when it could start. Researchers who could be using and citing the data today are instead hitting a paywall on the Index Snapshot ($149–$195, individual license, no redistribution) that is not fit for purpose for academic use — researchers need annual access to refreshed data and non-commercial redistribution rights, not a one-time timestamped export.

Evidence: MARKET_MONETIZATION §4E — "Researcher/academic data license: Small in direct revenue; Large in downstream citation / institutional awareness driving enterprise pipeline." PRICING_STRATEGY §3D — full spec exists, Phase 2 only. PRD §4 Phase 2 trigger: "First academic citation of Compassion Benchmark data OR 15 Index Snapshot sales."

**Proposed change:**
Move the Researcher Data License to Phase 1 launch (simultaneous with Index Snapshots). Create a single Gumroad product at $249/yr with explicit non-commercial terms. The product delivers: structured JSON/CSV of all 7 current indexes at time of purchase, plus a link to download each quarterly refresh for 12 months. Terms: non-commercial academic/NGO/journalism use only, attribution required, no redistribution, no client deliverables. Add a "Researcher License" card to the /purchase-research and /pricing pages adjacent to the Index Snapshot grid.

The trigger condition for Phase 2 expansion (team/institutional researcher license at $799/yr) should remain as specified. Only the individual researcher license moves to Phase 1.

**Expected revenue benefit:**
Direct: if 30 researchers purchase in Year 1 at $249/yr = $7,470 ARR. This is a minimum floor — the target audience includes policy school PhD students (approximately 20,000+ active PhD researchers in relevant fields), NGO analysts, and investigative journalists. Academic network effects compound: one researcher who uses the data in a published paper produces inbound inquiries from their peers. The indirect benefit (institutional awareness from citations) is estimated in MARKET_MONETIZATION as the primary value. One institutional buyer closed at $10,000/yr pays back 40 researcher licenses in direct revenue and an indefinite multiple in pipeline value.

**Independence-policy check:** PASS. Non-commercial license terms prohibit commercial redistribution. Attribution requirement preserves source traceability. Terms explicitly state that the research license does not provide any mechanism to influence entity scores or inclusion. The terms are drafted in PRICING_STRATEGY §3D and pass the independence policy standard.

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

## Priority Summary

| # | Candidate | Type | Priority Score | Recommended Phase |
|---|---|---|---|---|
| 2 | Free-to-paid email capture as launch precondition | fix | **15** | Pre-launch (MVP gate) |
| 5 | Quiet entity annual summary email | improvement | **13** | MVP Day 14 (parallel to paid CTA launch) |
| 6 | Researcher Data License at Phase 1 | improvement | **12** | Phase 1 (simultaneous with Index Snapshots) |
| 1 | Analyst Lite mid-tier ($499/yr, 15 entities) | new-SKU | **11** | Phase 2 |
| 3 | Team license for Index Snapshots at launch | improvement | **11** | MVP Day 3 (simultaneous with individual) |
| 4 | Briefing Archive dedicated marketing page | improvement | **11** | MVP Day 14 (before paywall goes live) |

---

## Flagged Assumptions

1. The free opt-in (Listmonk weekly digest) is assumed to be technically buildable within the static export constraint — this is documented as inline form posting to Listmonk subscribe API, which does not require server-side rendering. If Listmonk CORS or rate-limiting creates a blocker, the assumption needs verification before using the priority score for Candidate 2.

2. Researcher Data License feasibility assumes the full 7-index JSON/CSV export can be generated for Gumroad file delivery within Phase 1 timeline. The `export-public-data.mjs` script in `site/scripts/` generates per-entity score JSON — a full-index export script may need to be written. Effort estimate of 2 for Candidate 6 assumes this script exists or is trivial to produce.

3. Quiet entity annual summary email (Candidate 5) assumes the nightly pipeline or the Cloudflare Worker can be modified to fire a 30-days-before-renewal check without significant infrastructure change. If the Worker currently only handles webhook events and does not run scheduled queries against KV, effort is higher than scored.

4. Observer cannibalization risk (PRD §5, Experiment 3) is unresolved — the open decision says "do not add Observer to entity pages until week 5." None of the above candidates modify that decision. The Analyst Lite mid-tier (Candidate 1) is correctly a Phase 2 item that does not interact with the cannibalization experiment.

5. All revenue estimates are directional projections with no closed-subscription baseline. They should be treated as order-of-magnitude guidance, not forecasts, until the first 25 paid subscribers are active.

---

*Product Manager agent | 2026-05-28 | Analysis only — no product code modified. Downstream: PRD owner (Phil), frontend-engineer (Candidates 3, 4), backend-engineer (Candidate 5), analytics (all success metrics).*
