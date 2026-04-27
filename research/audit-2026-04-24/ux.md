# UX Audit — 2026-04-24

Audit scope: 25 routes, 3 primary personas, code-grounded (no live testing).
Analyst: UX Designer agent.

---

## Top 3 Critical Findings

1. **No site-orientation layer on cold arrival at /updates/[date]** — A visitor landing directly on the daily briefing from a LinkedIn post encounters no "what is Compassion Benchmark?" framing. The hero (`DailyBriefing.tsx` line 162–235) opens with stats (entities scanned, score changes) that assume the reader already knows what those numbers mean. The Navbar has "Contact Sales" as the only CTA-weight item. There is no persistent banner or section that explains the institution to a first-time reader. The purchase CTA block appears only after the score-changes section (line 502–519), meaning a visitor who skims to confirmations or sector trends may never see a conversion path.

2. **Score-Watch subscription has a broken Gumroad handoff** — `gumroad.ts` line 14 sets `scoreWatch` to a placeholder URL (`TODO-score-watch`) and line 30 sets `useGumroad: false`. The entity page CTA (`EntityDetail.tsx` line 295–325) routes the subscribe button to `/contact-sales?product=score-watch` for manual fulfillment. The `/score-watch` page hero (line 44–46) and the closing CTA (line 229) also route to `/contact-sales`, not Gumroad. Any user who wants to self-serve a $79/yr subscription hits a sales form instead of a checkout. This is a complete self-serve conversion gap for the highest-frequency product on entity pages.

3. **No 404 page and no graceful entity-not-found experience** — There is no `not-found.tsx` in `site/src/app/`. When Next.js triggers `notFound()` (called in `renderEntityPage.tsx` line 69 and `[date]/page.tsx` line 39), the framework falls through to a default Next.js 404 screen that carries no Compassion Benchmark branding, no navigation, and no recovery path to the indexes. For a site that drives traffic through entity-specific URLs in LinkedIn posts and news hooks, this is a high-frequency failure point.

---

## Journey Analyses

### Journey A: Cold LinkedIn arrival at /updates/2026-04-24 → conversion

**Entry point:** LinkedIn post links to `/updates/2026-04-24`. Visitor has zero prior exposure to Compassion Benchmark.

**Step 1 — Page load.**
The page renders `DailyBriefing` (`[date]/page.tsx` line 108). The archive banner is suppressed because this is the current date. The hero shows: eyebrow text "Daily evidence briefing · 2026-04-24", an H1 of "Daily Evidence Briefing", four stat tiles (entities scanned, entities assessed, score changes, confirmations), and a right-hand panel explaining the research methodology. The institution's name appears only in the sticky Navbar logo. There is no sentence that reads "Compassion Benchmark is an independent benchmark that..." at page level.

**Friction point A1:** "1,155 entities scanned" and "6 score changes" are meaningful only if the reader understands what entity types are tracked, what scoring means, and why this benchmark is credible. New visitors do not have that context. The "How this works" panel is in the right column of a two-column hero grid (`DailyBriefing.tsx` line 196) — useful context, but secondary in reading order and not visible until the user scrolls on mobile.

**Step 2 — Score changes.**
The Becton Dickinson card (`DailyBriefing.tsx` lines 248–412) is the most readable entry: colored border, entity name as a linked heading, delta badge, headline evidence, numbered evidence record. The "View entity profile" link at the bottom of each card (line 387–409) takes the user to `/company/becton-dickinson`. This is the right affordance.

**Step 3 — Purchase CTA.**
The `Callout` block ("Get the full benchmark report") renders after the score-changes section and before the confirmations table (line 502–519). It contains three CTAs: Purchase Research, Request Certified Assessment, Book Advisory. There is no Score-Watch mention here. A visitor primarily interested in "be alerted when BD's score changes again" gets no path to that product from this section. Score-Watch is only surfaced on the entity page, not on the updates page.

**Step 4 — Confirmations table.**
The confirmations section renders as an 8-column table (`DailyBriefing.tsx` lines 529–587). On desktop this is readable. On mobile this table overflows horizontally; `overflow-auto` on the wrapping div will produce a horizontal scroll container. The 8-column layout (Entity, Index, Band, Published, Assessed, Delta, Date, Finding) is dense and there is no progressive disclosure — all columns show always.

**Step 5 — Conversion.**
After the confirmations table comes Key Highlights, Newsletter, Sector Intelligence, Emerging Risks, Research Insights, Assessed Entities, and a closing CTA. The second purchase CTA ("Want the complete picture?", line 769–784) is the last major element before the footer. A visitor who read all the way to the bottom has a clear path. A visitor who stopped after score changes has only the mid-page Callout.

**Missing step:** There is no direct path from the updates page to `/score-watch`. A first-time visitor who reads about BD's score drop and thinks "I want to know the next time this changes" would need to: (a) notice the Score-Watch product name somewhere, (b) navigate to `/score-watch`, (c) discover the entity-scoped subscribe flow, (d) find the correct entity page, (e) click subscribe, (f) fill out a contact form rather than completing a checkout. That is five steps plus a contact-form gate before any transaction.

**Summary:** Cold LinkedIn arrival → understands the site in 2–3 scroll stops → reaches the BD entity page in 2 clicks → reaches Score-Watch product page in 3+ clicks from entity page → blocked at contact form, no self-serve checkout.

---

### Journey B: Investor arrives at /fortune-500 → wants Becton Dickinson context

**Step 1 — /fortune-500 landing.**
`fortune-500/page.tsx` renders `IndexHero` with band distribution stats, then a `RankingTable` with search + sector filter + sort controls. The search box placeholder is "Search company..." with a `min-h-[48px]` input. Finding Becton Dickinson requires typing the name — there is no visual signal to suggest the investor should look for BD specifically.

**Step 2 — Drilling into Becton Dickinson.**
`RankingTable.tsx` lines 133–143 render the company name as a `Link` to `/company/{slug}` when `entityKind="company"` is passed (which `fortune-500/page.tsx` line 95 does). One click from a found row to the entity page. This path works cleanly.

**Step 3 — Seeing BD's new score vs. previous score.**
`EntityDetail.tsx` renders:
- The current composite score in the hero panel (line 117–124): displayed as a large number, correct.
- The "Latest research update" callout (line 163–201): shows `latestChange.delta`, `latestChange.publishedScore`, `latestChange.assessedScore`, the headline, and a "View briefing" link to the daily update. This gives the investor the delta and the prior score in one section.

What is not shown: score history beyond the single latest change. There is no sparkline, no time series, no list of past movements. The investor can infer that a change happened and what the delta was, but cannot see the trajectory over time. `entityChanges.ts` stores only the most recent change per entity (by design, line 36: "The first record seen for a given entity wins"). This is a structural limitation.

**Step 4 — Seeing the current #1 F500 entity and why.**
The ranking table on `/fortune-500` is sorted by `rank` by default (`RankingTable.tsx` line 108). The top-ranked entity appears at row 1. Clicking its name opens the entity page showing its composite score and dimension bars. There is no editorial "why #1" text on the index page beyond the "Key findings" section (`fortune-500/page.tsx` lines 101–125), which covers sector-level findings, not individual entity explanations.

**Step count summary:** /fortune-500 → search for BD → click name → 2 clicks to entity page with latest change context. Current #1: visible at row 1 on /fortune-500, 1 click to entity page. Neither path requires more than 2 clicks.

**Gap:** The investor cannot compare BD's new score to peer companies in the medical sector from the entity page. The entity page has no "sector peers" section. The investor would need to return to the index, filter by sector, and manually compare — no direct affordance exists.

---

### Journey C: Analyst at /company/becton-dickinson — "why did this change?"

**What the analyst needs:**
(a) Current score
(b) Score history / delta
(c) Evidence that drove the change
(d) Link to the daily update that explained it

**What the page provides:**

(a) Current score — Present. Hero panel shows composite score prominently (`EntityDetail.tsx` line 117–124). Band label and rank are also shown.

(b) Score history / delta — Partially present. The `latestChange` callout (line 163–201) shows `delta`, `publishedScore`, `assessedScore`, and the date of the latest change. This satisfies the immediate delta question. Historical deltas (prior changes) are not available — `entityChanges.ts` only stores the most recent change per entity. An analyst wanting to see whether BD has been trending down over multiple cycles has no data surface on the site.

(c) Evidence that drove the change — Absent from the entity page. The `latestChange` object passed to `EntityDetail` contains only `headline`, `delta`, `bandChange`, `confidence`, and `status` (from `entityChanges.ts` lines 47–57). The `evidence` array (which DailyBriefing renders as a numbered list) is not included in the `EntityScoreChange` interface (`EntityDetail.tsx` lines 11–21). The entity page shows the headline but not the evidence list. The analyst must click "View briefing" to read the evidence.

(d) Link to the daily update — Present. The "View briefing" link (line 188–196) navigates to `/updates/{latestChange.date}`. This is correct. However, it links to the full daily briefing page, not to the BD-specific anchor within it. The daily briefing page does assign `id={change.slug}` to each score-change card (`DailyBriefing.tsx` line 264), but the "View briefing" link does not append `#becton-dickinson` to the URL. The analyst lands at the top of the briefing page and must scroll to find BD.

**Evidence review freshness stamp** — Present when `evidenceReview` is not null (line 132–160). Shows reviewed date, whether new evidence was found, and a summary if evidence was found. This is a useful signal for analysts but depends on the overnight scanner having touched BD recently.

**Summary of gaps:**
- Evidence items (the numbered sources) not surfaced on entity page — analyst must click through to briefing.
- "View briefing" link does not deep-link to the entity's anchor within the briefing.
- No score history beyond the single most recent change.
- No sector-peer comparison on entity page.

---

## Detailed Findings

### 1. Updates page IA (/updates/[date])

**Section order** (from `DailyBriefing.tsx`):
1. Hero with pipeline stats and "How this works" panel
2. Score movements (full evidence cards)
3. Inline newsletter nudge
4. Source intelligence (sectorAlerts)
5. Purchase CTA callout
6. Scores confirmed (table)
7. Key highlights
8. Newsletter card
9. Sector intelligence
10. Emerging risks
11. Research insights
12. Assessed entities grid
13. Closing CTA

**Scanability assessment:** The page follows a roughly correct hierarchy (headline findings first, supporting evidence later), but the section labels do not give enough differentiation. "Sector intelligence" and "Emerging risks" are visually differentiated by color treatment — sector intelligence uses a `Panel` with an accent bar (line 635), emerging risks uses an orange left-border card (line 656–681). The visual distinction is present but subtle, and both appear after the newsletter block, which is positioned mid-page rather than at the end.

The "Key highlights" section (line 589–614) sits after the confirmations table, meaning a user who wanted editorial summary first must scroll past the dense 8-column confirmations table to reach it. From a news-reading perspective, the natural order would be: headlines → score changes → editorial highlights → confirmations → sector trends → emerging risks → research insights.

The "Source intelligence" section (sectorAlerts) renders above the purchase CTA but below the newsletter nudge. Its position is inconsistent: it provides primary-source alerts (regulatory filings, court records) which are more important than the purchase CTA placed immediately after it.

The confirmations table (`DailyBriefing.tsx` line 529) has 8 columns with `overflow-auto` on the wrapper. On any viewport below approximately 900px, this table will scroll horizontally. Column headers use 0.82rem uppercase text. The "Finding" column (last, max-width 380px) is cut off on small screens and requires scrolling to read, even on tablets.

**Sector trends vs. emerging risks differentiation:** Sector intelligence is labeled "Analyst-level observations on patterns" while emerging risks are "Forward-looking risk signals ... early warning flags." The distinction is clear in the description text, but the section labels themselves ("Sector intelligence" vs. "Emerging risks") do require reading the subtitle to understand the difference. A journalist scanning quickly may conflate the two.

---

### 2. Entity page score-change visibility

**What is rendered** (from `EntityDetail.tsx`):
- Evidence review freshness stamp: renders when scanner data exists. Shows reviewed date and a one-line summary.
- Latest change callout: shows delta, headline, date, band change flag, "View briefing" link.
- Dimension bars: 8 dimensions with current scores.
- Score-Watch CTA block.
- Full index purchase CTA.

**What is not rendered:**
- The numbered evidence list from the daily briefing is not passed to `EntityDetail` — the `EntityScoreChange` interface has no `evidence` field.
- Score history beyond the single most recent change.
- Any "why this dimension changed" narrative at dimension level.
- Sector peer comparison.

**Deep-link gap:** `EntityDetail.tsx` line 188 generates `href={/updates/${latestChange.date}}`. The daily briefing cards have `id={change.slug}` (`DailyBriefing.tsx` line 264). The link should be `/updates/${latestChange.date}#${entitySlug}` to anchor directly. This is a missed connection that adds friction for analysts who click "View briefing" and land at the top of a long page.

---

### 3. /score-watch conversion UX

**What works:**
- Price is stated clearly in the hero button label ("Subscribe — $79/yr") and in the "Who buys Score-Watch" cards where "$79/yr per name" appears contextually (`score-watch/page.tsx` line 189).
- Independence policy is covered in the feature card grid (line 94–104) with a link to /about.
- The "How it works" three-step section (lines 121–154) is clear and low-jargon.
- The entity-index grid (lines 163–176) lets users navigate to any index to find an entity.
- The "typical buyers" section (lines 179–217) directly addresses "who is this for."

**What is missing or broken:**
- Both CTAs on the `/score-watch` page route to `/contact-sales?product=score-watch#inquiry` (lines 45, 229), not to a Gumroad checkout. There is no self-serve purchase path.
- The flow described in "Step 2: Subscribe from the entity page" (line 138) is factually correct — the entity page does have the subscribe button — but that button also routes to `/contact-sales` (confirmed by `gumroad.ts` line 30: `useGumroad: false`). The product's own instructional copy promises a checkout that does not exist.
- No objection handling copy for "how is this different from an ESG alert service" or "what sources does overnight research use." The methodology link covers the latter but is not surfaced here.
- The confirmation state after form submission is not visible in the code reviewed. `SalesInquiryForm.tsx` is the fulfillment mechanism, but the buyer has no visible confirmation of next steps after submitting.

**Independence policy signal:** Present and appropriately placed within the feature card grid. Not buried. The "Independence-preserving" card heading is explicit and the link to /about is functional.

---

### 4. Empty states and 404s

**No custom 404 page:** There is no `not-found.tsx` in `site/src/app/`. Next.js App Router requires a `not-found.tsx` at the app root for a branded 404 experience. Without it, the framework renders a bare default 404. For a dark-themed site with sticky navigation, the default Next.js 404 is visually jarring and has no recovery path.

**Entity not found:** `renderEntityPage.tsx` line 69 calls `notFound()` when `getEntityBySlug` returns nothing. This correctly triggers a 404 response. But without a custom not-found page, the visitor gets the same bare default screen.

**Date not in manifest:** `[date]/page.tsx` line 39 calls `notFound()` when the date is not in the manifest. Same issue — no branded recovery. A user who types `/updates/2026-04-25` (tomorrow) gets a bare Next.js screen with no path back to the latest briefing.

**Entity with zero recent assessment coverage:** When `latestChange` is null and `evidenceReview` is null, the entity page renders without the freshness stamp or the latest change callout. The page still shows: the hero with current score and rank, all 8 dimension bars, and the CTA blocks. This is a reasonable degraded state — the score is still meaningful. However, there is no text explaining that this entity has not been recently re-assessed. A visitor might interpret the absence of a freshness stamp as a site deficiency rather than an accurate "no recent change" signal. The `evidenceReview` render is conditional (line 132), but the conditional is only `{evidenceReview && (...)}` — there is no "last reviewed: unknown" fallback text.

---

### 5. Mobile / responsive

**Ranking table on /fortune-500:**
`RankingTable.tsx` line 187 wraps the table in `<div className="overflow-auto ...">`. The table has 13 columns (CR, F500, Company, Sector, AWR, EMP, ACT, EQU, BND, ACC, SYS, INT, Score, Band — 14 in the column definition at `fortune-500/page.tsx` lines 23–37). On a 375px viewport, this table is completely unusable without horizontal scrolling. The dimension score columns (8 columns of 3-letter abbreviations at `px-2.5` padding) require approximately 800px minimum to read without scrolling. There is no responsive collapse — all columns render at all breakpoints. The controls (search + filter + sort) use `grid-cols-1 md:grid-cols-[1fr_220px_180px]` which stacks correctly on mobile.

**Daily briefing on mobile:**
The hero grid is `lg:grid-cols-[1.15fr_0.85fr]` (DailyBriefing.tsx line 196), which collapses to single column on mobile — correct. The date navigation tabs (`flex flex-wrap gap-2`) wrap cleanly. Score change cards (`rounded-[20px] p-6`) have a flex header row that is `flex-wrap` (line 268) — scores and entity name will stack on narrow viewports. This is handled.

The confirmations table (line 529) has `overflow-auto` but the 8-column layout with `py-4 px-5` cells will produce a table approximately 900px+ wide. On a phone this is a horizontal-scroll experience, not a readable one.

**Entity detail on mobile:**
Hero section uses `flex-col lg:flex-row` (line 88) — stacks correctly. Dimension bars use `grid-cols-1 md:grid-cols-2` (line 222) — 1 column on mobile, readable. The Score-Watch CTA uses `flex-col lg:flex-row` (line 275) — stacks on mobile. Generally mobile-appropriate except for the overall page density.

**Navbar mobile:**
The mobile hamburger menu (`Navbar.tsx` line 126) renders a full vertical list with all navigation items, indexes, and tools. The `Contact Sales` CTA button is at the bottom of the list (line 204–210) — below the fold on mobile for a user who just opened the menu. A mobile visitor's primary CTA is not immediately visible.

---

### 6. Independence-policy signaling

**Where it appears:**
- Homepage `page.tsx` lines 428–441: "Independence policy" panel with a 5-item bulleted list. Located near the bottom of the page after the services section.
- `purchase-research/page.tsx` lines 329–341: "Commercial integrity rules" panel in the page body.
- `contact-sales/page.tsx` lines 138–145: "Commercial integrity policy" panel.
- `score-watch/page.tsx` lines 94–103: "Independence-preserving" feature card within the product feature grid.
- `page.tsx` (homepage) line 192–203: "A benchmark institution, not a campaign site" callout — addresses the independence concept without naming it explicitly.

**Where it is absent or weak:**
- The updates page (`DailyBriefing.tsx`) has no independence statement. A first-time visitor reading score changes has no context for why the scoring is trustworthy or who funds it.
- Entity pages (`EntityDetail.tsx`) have no independence note. A visitor who arrives directly at `/company/becton-dickinson` from a news article has no signal that the benchmark is editorially independent.
- The `/fortune-500` index page has no independence statement. The "Go deeper" service cards (line 134–170) link to commercial products without a trust disclaimer nearby.

**Placement quality:** Where the policy does appear, the copy is appropriately direct and non-defensive ("Entities do not pay to be included," not "We are committed to integrity"). The homepage placement is too deep in the page (section 9 of 12) for cold visitors who may not scroll far. The Score-Watch product page placement is correct — it appears within the feature grid, not at the bottom.

---

## Quick Wins (each under 1 day, each visibly improves a persona's journey)

1. **Add `#entity-slug` anchor to "View briefing" links on entity pages.** `EntityDetail.tsx` line 188: change `href={/updates/${latestChange.date}}` to `href={/updates/${latestChange.date}#${entity.slug}}`. No schema change needed — the anchor `id` already exists in `DailyBriefing.tsx` line 264. Analyst journey: removes one scroll-to-find step after clicking through from an entity page.

2. **Add a site-orientation one-liner to the DailyBriefing hero.** In `DailyBriefing.tsx` between the eyebrow and H1 (line 198), add one sentence: "Compassion Benchmark is an independent institution that scores 1,155 governments, corporations, and AI labs on structured criteria. Each finding below is evidence-linked." This costs nothing and orients every cold arrival without disrupting the existing layout.

3. **Add a custom `not-found.tsx` at `site/src/app/`.** Render the Navbar, a brief "Page not found" message, links to `/updates`, `/indexes`, and `/fortune-500`, and the Footer. This requires only a new file using existing UI primitives. Recovers all cold-traffic 404s and date-not-found errors.

4. **Surface Score-Watch in the updates page purchase CTA.** In `DailyBriefing.tsx` lines 502–519, add a fourth button: "Subscribe to Score-Watch — $79/yr per entity" linking to `/score-watch`. The Callout component already renders a `flex flex-wrap gap-3` button row. This adds one CTA where intent is highest (just read a score change).

5. **Add a brief "no recent assessment" note to entity pages when both `latestChange` and `evidenceReview` are null.** In `EntityDetail.tsx`, after the hero section, add a small muted note: "No recent score changes detected in the last [N] days. Scores reflect the published 2026 benchmark." This prevents the silent empty state from appearing broken.

---

## Strategic UX Bets (each over 1 week, each materially moves a KPI)

1. **Self-serve Score-Watch checkout via Gumroad (unblocks the primary subscription product).** `gumroad.ts` has a `TODO-score-watch` placeholder and `useGumroad: false`. Creating the Gumroad product and setting `useGumroad: true` removes the contact-form gate from the entity page subscribe flow and from the `/score-watch` page. Every entity page currently shows a prominent "$79/yr" subscribe button that routes to a form. The gap between that button's implied promise (checkout) and the actual experience (form submission, wait for response) loses a measurable fraction of purchase intent. Impact: directly converts the highest-intent moment on the site (an analyst just read about a score change on the entity they care about).

2. **Mobile-first ranking table redesign.** The current `RankingTable` renders 14 columns at all breakpoints. For mobile, a card-per-row view (entity name, composite score, band, one dimension highlight) would replace the horizontal-scroll table. The existing `filterKey` and search controls already stack correctly. A card layout at `sm` and below, with a "see all columns" expand or a link to the entity page, would make `/fortune-500`, `/ai-labs`, and `/countries` usable on phones — expanding the addressable audience for LinkedIn and news-driven mobile traffic. Impact: increases time-on-site for mobile arrivals and improves index-to-entity conversion rate.

3. **Entity page score history panel (requires data pipeline change).** Currently `entityChanges.ts` stores only the most recent score change per entity. Storing the last N changes (5–10) per entity in a time-ordered array would allow the entity page to render a minimal history — a timeline or small table showing date, delta, and headline for each past change. This directly serves the investor persona ("has BD been trending down?") and the analyst persona ("what was the trajectory before this event?"). It also gives Score-Watch a stronger value proposition: the subscriber is told about future changes, and the entity page shows past changes, making the subscription feel like "the next entry in this history." Impact: increases entity page session depth and Score-Watch conversion by making score trajectory visible at the point of highest intent.
