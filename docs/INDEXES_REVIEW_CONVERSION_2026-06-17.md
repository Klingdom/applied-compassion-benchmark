# Indexes Hub — Conversion Review (Path-to-Action)

**Date:** 2026-06-17
**Reviewer:** Conversion Strategist (white-hat, independence-preserving)
**Surface:** `site/src/app/indexes/page.tsx` (+ `EntitySearch.tsx`, `PickEntityCallout.tsx`)
**Goals evaluated:** (1) Knowledge acquisition — enter an index; (2) Understand the methodology; (3) View the daily briefing.
**Constraint:** Review only — no site code modified.

---

## State note (read first)

The task brief states S1 removed the "Index buyer paths / Revenue path" tables and the "Recommended CTAs" panel, and reframed "Monetization model" to "How the benchmark stays free and funded." The live file at review time only partially reflects that:

- **"How the benchmark stays free and funded"** rename is present (lines 185-195). PASS.
- **The buyer-path table is still present** — the hero "How to use the indexes" Panel (lines 45-72) is exactly a Need to Best-path buyer table ("Buy the first published report", "License structured data", "Go to Advisory", "Go to Certified Assessments"). This appears to be the artifact S1 was meant to remove, or a second instance of it. **Flag: confirm whether this panel should have been removed in S1.** All findings below treat the file as-is.

---

## Headline assessment

The indexes hub is, functionally, a **storefront**, not a research hub. Of the page's nine sections, **four are commerce** (hero buyer-path table, "Featured launch" $195 product card, "Public benchmark first" callout, and the six-card "Go deeper with benchmark products" grid) plus the closing services link row. The three reader-value goals fare as follows:

- **Goal 1 (enter an index):** Served, but buried. The 7-index grid is section 5 of 9, sits *below* a full-width $195 product pitch, and each card is a name + one-line definition with **no reason-to-click and no scores/proof**.
- **Goal 2 (methodology):** **Effectively absent.** "Methodology" appears exactly once, as the first item in a plain text link row in the final footer panel (line 245). There is no inviting path to the method from a hub whose entire credibility rests on it.
- **Goal 3 (daily briefing):** **Completely absent.** The string "updates", "briefing", or "daily" does not appear anywhere on the page (confirmed by grep). The single most active, most repeat-visit-worthy free asset on the site — a briefing published every weekday across 1,155 entities — has zero presence on the hub that should funnel to it.

The primary action is also unclear. The hero offers three co-equal buttons — "View Countries Index" (primary), "Buy First Published Report" (commerce), "Data Licensing" (commerce) — so two of the three first actions a reader sees are sales, on a page positioned as the "public-facing core." This inverts principle 8 (free value is the funnel): the free experience is framed as a teaser for paid products rather than complete on its own.

**Net:** the hub does not give a clear, reader-benefit-led primary action, and two of the three stated goals have no real entry point. This is the highest-value fix area on the page.

---

## Detailed findings by section

### Hero (lines 21-75) — competing CTAs, commerce-forward

- **Problem:** Three co-equal buttons; "primary" visual weight is on "View Countries Index" but it's flanked by two commerce CTAs, and the body copy ("public-facing core of the platform") sells the *platform* rather than inviting a reader action. The hero stat "Public + Premium / Free rankings with paid formats and services" leads with the product model, not the reader benefit.
- **Right primary action for this page:** explore an index or run a lookup — not buy. The hero should make "start exploring" obvious in 3 seconds.

### Hero "How to use the indexes" Panel (lines 45-72) — buyer table mislabeled as guidance

- **Problem:** Titled "How to use the indexes" but four of five rows are purchase/service paths (buy report, license data, advisory, certified review). Only one row ("Browse rankings") serves a reader who just arrived to *read*. For goals 1-3, this panel actively misdirects: a reader looking to understand the benchmark is steered toward a sales funnel. This is the likely S1 leftover.
- **Message-match failure:** the reader's intent on /indexes is "what is here / where do I start," and the answer presented is mostly "here's what to buy."

### Entity search (lines 77-86) — good asset, ranked too low

- **Strength:** This is the best feature for Goal 1 (fast lookup) and the lowest-friction win on the page. It searches 1,155 entities, links straight to detail pages, and is already instrumented (`trackEvent`).
- **Problem 1 — placement:** it sits *below* the hero buyer table. The fastest path to value (find your country / company / lab) should be near the top, ideally in or directly under the hero.
- **Problem 2 — search footer is commerce-only (lines 243-258):** after a successful search the only follow-on is "Purchase benchmark research" / "book an advisory briefing." A reader who just found an entity has peak intent to *read more for free* (open the entity, see the daily briefing, learn the method) — and is instead offered only paid paths. This spends trust at the exact moment to build it.

### Featured launch + Public-benchmark callout (lines 88-143) — full commerce block above the indexes

- **Problem:** A full-width $195 product card with a price panel, plus a reinforcing callout, occupy the prime real estate *between* search and the index grid. On the hub whose job is to route readers to free value across three goals, the largest single visual element is a single paid SKU. The "Now available / first published report" framing is legitimate but does not belong above the free indexes on this surface.

### PickEntityCallout (line 148) — fine, conditional

- Only renders for `#pick-entity-to-watch` arrivals (Score-Watch funnel). No issue; correctly conditional and message-matched to that source.

### Current indexes grid (lines 145-180) — names without reasons-to-click

- **Problem:** Each card is title + a definitional sentence. There is no compelling reason-to-click: no score range, no top/bottom example, no "what you'll find," no entity count per family. "Comparative benchmark across all 50 states and the District of Columbia" describes the dataset, not what the reader *gets*. Principle 6 (specific beats vague): cards should carry a number, a name, or a finding.
- **Problem — non-index card in the index grid:** "Assess Your Organization" (line 168) is a commercial assessment entry point placed inside the "Current indexes" grid alongside actual indexes. It dilutes the grid's job and reduces scannability for Goal 1.

### "Stays free and funded" + Independence panels (lines 182-207) — strong, keep

- **Strength:** This pairing is the trust core and reads as transparency, not sales. The independence list ("Entities do not pay to be included… to improve a score") is exactly right and should be *more* prominent in the reader's path, not buried two-thirds down.

### "Go deeper with benchmark products" grid (lines 209-235) — appropriate, but the only "next step" offered

- **Problem:** This six-card commerce grid is well-built and correctly scoped to access/interpretation. But because no free-path equivalents exist (no "Read today's briefing" / "Learn the method" cards), the *only* curated next-step grid on the page is the paid one. The funnel has a paid lane and no free lane.

### Closing panel (lines 237-266) — methodology demoted to a text link

- **Problem:** "Methodology" is the first of eight inline text links, visually identical to "Contact Sales." For an independence-first benchmark, the method is the product's credibility and a primary reader destination — it deserves a real, benefit-led path, not a footer link.

---

## Ranked improvements

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each 1-5).

### 1. Add a "Read today's briefing" path to the hub — HIGHEST LEVERAGE [Goal 3]
- **Page(s):** `site/src/app/indexes/page.tsx`
- **Problem:** Zero links to `/updates` anywhere on the page (grep-confirmed). The most repeat-worthy free asset — a weekday briefing scored across 1,155 entities — has no entry point from the hub.
- **Proposed change:** Add a prominent free-value card/band directly under the hero or entity search. Suggested copy:
  - Eyebrow: "Published every weekday"
  - Title: "See what moved today across 1,155 entities"
  - Body: "The daily briefing tracks score movements, sector signals, and evidence-linked findings — free, every weekday morning."
  - Primary button: **"Read today's briefing"** to `/updates`; secondary text link "Browse the archive" to `/updates/archive`.
  - Also add a third hero button replacing one commerce CTA: **"Read today's briefing"**.
- **Conversion benefit:** Opens the strongest free-engagement and return-visit loop (briefing to subscription to support) — currently a dead end on this hub.
- **Independence check:** PASS. Promotes free research; builds trust by leading with given-away rigor.
- Impact 5 · Strategic Alignment 5 · Learning Value 4 · Confidence 5 · Effort 2 · Risk 1 · **Priority = 16**

### 2. Make the hero primary action reader-first; demote commerce CTAs [Goal 1]
- **Problem:** Two of three hero buttons are sales ("Buy First Published Report", "Data Licensing"); body sells the platform, not a reader action.
- **Proposed change:** Hero buttons become: primary **"Explore the indexes"** (anchor to the grid) or **"Look up any entity"** (anchor to search); secondary **"Read today's briefing"** (`/updates`); tertiary **"How we score"** (`/methodology`). Move "Buy" / "Data Licensing" into the existing "Go deeper" grid where intent is appropriate. Rewrite the fourth stat from "Public + Premium / Free rankings with paid formats and services" to a reader benefit, e.g. "Free / Every ranking is free to read."
- **Conversion benefit:** Establishes one clear free primary action in 3 seconds; aligns first impression with the "public-facing core" claim.
- **Independence check:** PASS. Free-first framing is the trust asset; commerce still present, just at correct intent.
- Impact 5 · Strategic Alignment 5 · Learning Value 3 · Confidence 4 · Effort 2 · Risk 2 · **Priority = 13**

### 3. Replace / relabel the hero "How to use the indexes" buyer table [Goals 1-3]
- **Problem:** Titled as guidance but is a 4/5-commerce buyer table (lines 45-72); misdirects readers pursuing all three free goals. Likely the S1 artifact.
- **Proposed change:** Replace rows with reader-intent paths:
  - "Find a specific entity" to "Search all 1,155 entities"
  - "Compare a sector" to "Open an index"
  - "See today's movements" to "Read the daily briefing"
  - "Understand the scoring" to "Read the methodology"
  - Keep one commerce row: "Go deeper (reports, data, advisory)" to "Benchmark products".
  - Keep the closing independence sentence (line 69-71) — it's good.
- **Conversion benefit:** Turns a sales table into a true wayfinding panel covering all three goals; resolves message-match failure.
- **Independence check:** PASS. Leads with free paths; reframes commerce as optional depth.
- Impact 4 · Strategic Alignment 5 · Learning Value 3 · Confidence 4 · Effort 2 · Risk 2 · **Priority = 12**

### 4. Give each index card a reason-to-click [Goal 1]
- **Problem:** Cards are name + definition; no proof, score, or finding (lines 154-177). "Assess Your Organization" (commercial) is mixed into the index grid.
- **Proposed change:** Add one concrete data point per card — entity count and/or a notable finding. Examples: Countries — "193 countries scored; see who leads and who lags on suffering response." Fortune 500 — "447 companies scored on public evidence — find any one in seconds." AI Labs — "50 labs ranked on safety posture, accountability, and deployment boundaries." Move "Assess Your Organization" out of the grid into the "Go deeper" products section.
- **Conversion benefit:** Specific, benefit-led cards lift click-through into indexes (Goal 1); cleaner grid improves scannability.
- **Independence check:** PASS. Surfaces free findings; the "find any one in seconds" framing reinforces free access.
- Impact 4 · Strategic Alignment 4 · Learning Value 4 · Confidence 4 · Effort 3 · Risk 1 · **Priority = 12**

### 5. Move entity search up and add free follow-on links [Goal 1]
- **Problem:** Search (best Goal-1 asset) sits below the hero buyer table; its post-result footer (lines 243-258) offers only paid follow-ons.
- **Proposed change:** Promote search into / directly under the hero. In the result footer, lead with free next steps before paid: "Open the full entity page, see it in today's briefing, or read how we scored it." Keep "Purchase research / advisory" as a secondary line.
- **Conversion benefit:** Fastest path to value placed at peak intent; converts a successful search into deeper free engagement (Goals 2-3) instead of an immediate sales ask.
- **Independence check:** PASS. Reduces the "monetize the moment of value" pattern; offers free depth first.
- Impact 4 · Strategic Alignment 4 · Learning Value 4 · Confidence 4 · Effort 2 · Risk 1 · **Priority = 13**

### 6. Add a methodology invitation, not just a footer link [Goal 2]
- **Problem:** "Methodology" appears only as one inline text link (line 245), visually equal to "Contact Sales."
- **Proposed change:** Add a short benefit-led methodology entry near the independence panel: Title "How we score every entity" / Body "8 dimensions, 40 subdimensions, primary-source evidence, designed to be hard to game." / Button **"Read the methodology"** to `/methodology`. Pairs naturally with the independence panel to form the trust block.
- **Conversion benefit:** Creates a real path for Goal 2; deepens the trust readers need before they value the rankings or convert later.
- **Independence check:** PASS. Transparency of method is the core trust signal.
- Impact 3 · Strategic Alignment 5 · Learning Value 3 · Confidence 4 · Effort 2 · Risk 1 · **Priority = 12**

### 7. Rebalance commerce blocks below free value [funnel coherence]
- **Problem:** Featured $195 product + reinforcing callout (lines 88-143) sit above the index grid; the page's largest visual element is a single paid SKU.
- **Proposed change:** Move the Featured launch and "Public benchmark first" callout to *below* the index grid and free-path section (briefing/methodology). Keep them — just stage them after the free experience is presented, honoring "free experience complete on its own."
- **Conversion benefit:** Correct funnel order (read free to optionally go deeper); reduces the storefront feel that undercuts the independence brand.
- **Independence check:** PASS. Commerce retained and labeled; no inclusion/score-for-sale implication.
- Impact 3 · Strategic Alignment 4 · Learning Value 2 · Confidence 4 · Effort 2 · Risk 2 · **Priority = 9**

---

## Manipulative-pattern scan

No dark patterns found. No fake urgency, countdowns, or alarmist "alert/risk" bait. The "Now available / first published report" framing is honest. The "How to use the indexes" buyer table is a **message-match / misdirection** problem (sales dressed as guidance), not a dark pattern — the white-hat fix is improvement #3 (relabel to true reader paths). The post-search commerce-only footer (#5) is the closest thing to spending trust at an intent peak; fix is to lead with free follow-ons.

---

## Handoffs

- **Knowledge-architect:** section ordering of the hub (free value before commerce, #7) and whether "Assess Your Organization" belongs in the index grid (#4) are information-structure calls.
- **UX:** visual weight of the new briefing band and hero button hierarchy (#1, #2).
- **Open question for owner:** confirm whether the hero "How to use the indexes" buyer table (lines 45-72) was supposed to be removed in S1.

---

## Highest-leverage change site-wide (this surface)

**Add a "Read today's briefing" path to the indexes hub (#1).** The daily briefing is the platform's strongest free, repeat-visit asset — published every weekday across 1,155 entities — and it currently has *zero* presence on the hub that should funnel to it. Adding a prominent, benefit-led briefing entry ("See what moved today across 1,155 entities — free, every weekday") opens the single most valuable free-engagement loop on the page, directly serves the most-neglected of the three goals, builds trust by leading with given-away research, and is low effort and low risk.
