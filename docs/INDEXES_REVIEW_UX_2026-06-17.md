# /indexes Page UX Review — 2026-06-17

**Reviewer:** UX Designer agent  
**Scope:** `site/src/app/indexes/page.tsx`, `EntitySearch.tsx`, `PickEntityCallout.tsx`, IndexHero context, cross-referenced against `site/src/app/page.tsx` and `Navbar.tsx`  
**Goals evaluated:** (G1) knowledge acquisition, (G2) understanding the methodology, (G3) discovering + viewing the daily briefing  
**Mode:** Review only — no code changes

---

## Section 1 — Current page structure (as-rendered scroll order)

1. Hero — h1 + lead paragraph + 3 buttons + 4 stats + "How to use the indexes" table (Panel)
2. Entity search — full-width search field across all 1,155 entities
3. Featured launch card — 2026 Countries Index $195 purchase
4. "Public benchmark first. Premium depth when needed." (Callout)
5. PickEntityCallout (hash-gated, invisible to most visitors) + SectionHead + 7-index card grid
6. Funding/Independence two-panel pair
7. "Go deeper with benchmark products" — 6 service cards
8. Closing nav Panel + independence footnote

---

## Section 2 — Highest-leverage finding (lead this)

**The 7-index card grid carries no data that enables a visitor to choose.**

Each card in the grid contains: two pills (year + sector label), a title, and one descriptive sentence. No entity count. No band summary. No score snapshot. No signal of what is inside. A visitor scanning the grid cannot differentiate the cards at the information level — they can only differentiate by sector label and title.

The home page already contains the same 7-index grid at the same description level, plus it renders per-index band-distribution bars (BandDistributionBar) directly beneath each card title. The /indexes grid has neither the bars nor the entity counts. The home page is therefore more informative than the hub page that is supposed to be the entry point.

This is the single most impactful problem to solve. Everything else below is secondary.

---

## Section 3 — Detailed findings by goal

### G1 — Knowledge acquisition

**Finding 1 (critical): Index cards do not carry the data needed to support a choice.**

Current card anatomy: pills (year, sector) + h3 title + one descriptive sentence.  
Missing from every card: entity count, band distribution, top-ranked entity, any score signal.

A researcher landing on /indexes to decide which index to enter must choose between "Countries Index" and "U.S. States Index" with no information advantage over a visitor who has never heard of the site. The card descriptions are structurally identical in format and comparable in length. The only differentiator is sector category.

The home page's "Seven indexes at a glance" section (line 169–200, `page.tsx`) renders a BandDistributionBar for each of the 7 indexes inside a card with a "View index →" link. That section is more useful for index selection than /indexes itself.

Recommendation (ELEVATE + ADD): Each index card on /indexes should carry: entity count, a mini BandDistributionBar, and the name of the top-ranked entity. These are available from the same JSON files already loaded by EntitySearch. No new data is required.

---

**Finding 2 (moderate): Entity counts are inconsistent between the hero stats and the home page stats.**

Hero stat on /indexes: "1,155 entities benchmarked."  
Home page stats table lists actual per-index counts: 207 countries, 51 states + DC, 447 Fortune 500, 50 AI labs, 50 robotics labs, 150 U.S. cities, 250 global cities.  
Sum of those figures = 1,205, not 1,155.

The /indexes page also shows the aggregate stat ("1,155") but the index cards do not show any per-index count. A visitor cannot ground "1,155" in the actual index breakdown without already knowing those numbers. The home page gives them; /indexes does not.

The home page panel (line 81–119, `page.tsx`) is a direct "Current publication set" table with Index + Coverage columns. The /indexes page does not have this table but also does not have a substitute. The hero "How to use the indexes" table (lines 46–68, `page.tsx indexes`) lists use-case routing, not coverage. These serve different needs and should not replace each other — but /indexes should surface coverage.

Recommendation (ADD): Surface per-index entity counts on the cards or in a coverage summary panel in the hero. The data is already loaded by EntitySearch.

---

**Finding 3 (moderate): "Assess Your Organization" is in the 7-card index grid.**

The grid section is titled "Current indexes." The card at position 6 (of 6 rendered in the non-featured group) links to `/assess-your-organization` with pills "Assessment" and "Entry Point." This card is not an index. Its presence in a grid titled "Current indexes" creates category confusion. A visitor scanning for the 7 published rankings will count 7 cards (Countries featured + 5 non-featured + Assess Your Org) and either wonder where the 7th index is or assume Assess Your Org is one of them.

Two actual indexes — U.S. Cities and Global Cities — are missing from the grid entirely. They are in the home page's published indexes section but not in the /indexes page grid.

Recommendation (TRIM + REORDER): Remove "Assess Your Organization" from the index grid. Add the two missing city indexes (U.S. Cities, Global Cities) so all 7 are represented. Move "Assess Your Organization" to the service cards section below, or give it its own callout near the bottom.

---

**Finding 4 (low): The hero h1 and the home page h1 share nearly identical framing.**

/indexes h1: "Explore benchmark rankings across governments, corporations, AI, and robotics"  
Home h1: "Benchmarking how institutions recognize, respond to, and reduce suffering"

These are sufficiently different in meaning. No action required. However, the /indexes lead paragraph ("The indexes are the public-facing core...") is institutional self-description rather than visitor orientation. A visitor arriving directly on /indexes from a search result does not yet know why they should care about any particular index. The paragraph answers "what is this" at a product level, not "what should I do next."

Recommendation (COPY): Reframe the lead paragraph to orient the visitor toward choosing an index, not to explain the product's position. Hand to copy/knowledge-architect for rewording. Flag as low priority — it is a friction reduction, not a path blocker.

---

### G2 — Methodology understanding

**Finding 5 (critical): No path to Methodology in the body of the page until the footer-equivalent closing panel.**

The hero hero has three buttons: "View Countries Index," "Buy First Published Report," and "Data Licensing." Methodology is absent from the hero. It does not appear as a card in the index grid. It does not appear in any section heading until the very last section (closing nav panel at line 238–265), where it is a plain inline text link in a row of 8 links at 0.92rem size.

The only above-the-fold Methodology affordance is via the global navbar. Users who are on /indexes specifically to understand the benchmark before trusting the scores have no visible invitation to do so until they scroll past: hero, entity search, featured launch card, callout, index grid, two funding panels, and six service cards — approximately 7 sections.

This is a direct failure on Goal 2. The methodology is the trust mechanism. A visitor evaluating whether to act on the rankings must be able to reach it directly from the hub page that presents those rankings.

Recommendation (ELEVATE): Add a "Methodology" button alongside the existing hero CTA row. Alternatively, add a compact methodology teaser panel (parallel to the "How to use the indexes" panel) that says what the framework is and links to /methodology. The panel slot already exists in the hero's right column (currently occupied by the "How to use the indexes" table, which duplicates the same routing information that could be shortened to make room).

---

**Finding 6 (moderate): The "How to use the indexes" table routes to services, not to learning.**

The hero panel table maps five needs to five paths. The paths are all commercial or use-case routing: "Buy the first published report," "Go to Data License," "Go to Advisory," "Go to Certified Assessments." "Browse rankings" maps to "Use the public index pages" — but this is where the visitor already is.

"Interpret results → Go to Advisory" is the only path that touches understanding, and it routes to a paid service. Understanding the methodology (free) is not represented.

Recommendation (REORDER + TRIM): Replace "Browse rankings → Use the public index pages" (redundant — user is already here) with "Understand the scoring → Read Methodology" and link it. Remove or consolidate the service rows that duplicate the "Go deeper" section further down the page.

---

### G3 — Discovering and viewing the daily briefing

**Finding 7 (critical): The daily briefing has zero presence on /indexes.**

The home page devotes a full section to "Today's research" (lines 203–276, `page.tsx`) with score change cards, a highlights callout, a "View full briefing" button, and a live stats row (entities scanned, assessed, score changes). A visitor on the home page cannot miss the daily briefing.

A visitor on /indexes receives none of this. The only reference to ongoing research or updates is the methodological note that "a four-stage nightly pipeline monitors every benchmarked entity" — which exists on the Methodology page, not /indexes.

The nav's "Updates" link carries a pulsing red dot (live indicator), but this is a 7px dot next to a text label. It is the only signal of live activity available to a visitor reading /indexes.

The closing nav panel links to "/research" and "/data-licenses" but not to "/updates."

Recommendation (ELEVATE): Add a compact briefing strip between the entity search section and the featured launch card. This strip should show: the current date, 1–2 top score movements from `updates.latest.json` (the same data the home page uses), and a "View full daily briefing" button. This directly supports G3 and also reinforces G1 (the indexes are live, not static).

Alternatively, as a lower-effort option: Add "/updates" to the closing nav panel links and to the hero CTA row. The current closing panel has 8 links; Updates is absent from all of them.

---

## Section 4 — Redundancy audit: /indexes vs. home page

| Content element | Home page | /indexes |
|---|---|---|
| 7-index card grid with descriptions | Yes | Yes (missing 2 indexes, includes non-index card) |
| Per-index band distribution bars | Yes (all 7, BandDistributionBar) | No |
| Per-index entity counts (coverage table) | Yes (panel in hero) | No |
| Aggregate stats (1,155 / 7 indexes) | Yes | Yes |
| Daily briefing / score changes | Yes (full section) | No |
| Methodology link in above-fold CTAs | Yes ("Read Methodology" button) | No |
| Independence policy | Yes (full panel) | Yes (full panel, nearly identical) |
| "How the benchmark works" (8 dimensions) | Yes (panel) | No |
| Service cards (6) | Yes | Yes (identical set) |
| Newsletter signup | Yes (section) | No |
| Entity search | No | Yes |
| Featured launch card (Countries PDF) | Yes (callout) | Yes (full card with pricing) |

Assessment: /indexes is currently additive in exactly two ways — the entity search bar and the expanded Countries PDF purchase card. Everything else it contains is present on the home page in equal or greater depth. The page receives navigation traffic (it is the primary nav item) but delivers less information about the indexes than the home page does.

The page needs to earn its position as the hub. Right now it functions as a thinner version of the home page with a search bar bolted on.

---

## Section 5 — Mobile assessment

The page uses responsive grids consistently (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). No layout-specific mobile issues observed at the code level.

However, on mobile the scroll depth to reach the 7-index card grid is substantially longer than on desktop due to the hero, entity search section, featured launch card, and callout all stacking full-width. The grid — the nominal primary purpose of the page — appears below three commercial sections. On a 390px viewport the grid is likely below the fold by 1,200–1,400px of content.

Recommendation (REORDER): Move the 7-index card grid (currently section 5) to section 2, immediately after the hero. The entity search, featured launch card, and premium callout can follow. The reason to click into an index should precede the invitation to buy something.

---

## Section 6 — Card affordances

Cards with `href` render as `<Link>` elements (full card is clickable). The hover state is `-translate-y-px` with a mild background brightening. This is identifiable as clickable on desktop (pointer cursor, lift animation) but invisible on touch devices. There is no explicit "View index" or "Browse rankings" label on any card — the card title is the only visible affordance.

The featured Countries card uses `variant="featured"` (sky-blue border gradient), which visually distinguishes it. The remaining 5 non-featured cards use `variant="default"` and are visually identical to each other.

Recommendation (ADD): Add an explicit "View index →" text link at the bottom of each card (the home page's small-multiple section does this: `"View index →"`). This improves touch affordance and removes ambiguity about whether the card is a navigation element or an information panel.

---

## Section 7 — Empty and loading states

EntitySearch has correct states:
- Loading: input disabled, placeholder shows "Loading entity data..."
- Loaded: placeholder shows "Search N entities across all indexes..."
- No results: "No entities found matching X" with a bordered, centered message
- Results footer: post-result upsell to purchase or advisory

These are adequate. No gaps identified.

The PickEntityCallout is hash-gated and invisible to direct /indexes visitors. This is intentional (Score-Watch referral context) and correctly implemented.

---

## Section 8 — Ranked improvements

Priority score = (Impact + Strategic Alignment + Learning Value + Confidence) − (Effort + Risk)  
Scale: each factor 1–3. Max priority = 12 − 2 = 10.

| # | Improvement | Goal(s) | Action | Priority |
|---|---|---|---|---|
| 1 | Add entity count + BandDistributionBar to each index card | G1 | ADD | 10 |
| 2 | Reorder: move 7-index grid to section 2 (before purchase/commercial content) | G1, G3 | REORDER | 9 |
| 3 | Add daily briefing strip (score changes + "View full briefing") | G3 | ELEVATE | 9 |
| 4 | Add Methodology to hero CTA row (alongside existing buttons) | G2 | ELEVATE | 9 |
| 5 | Fix index grid: remove "Assess Your Organization," add U.S. Cities + Global Cities | G1 | TRIM + ADD | 8 |
| 6 | Add "View index →" affordance text to each card | G1 | ADD | 7 |
| 7 | Add Updates link to closing nav panel (currently absent) | G3 | ADD | 7 |
| 8 | Replace "Browse rankings → Use public index pages" row in hero table with "Understand scoring → Methodology" | G2 | REORDER | 6 |
| 9 | Add coverage summary (per-index entity counts) to hero or index cards | G1 | ADD | 6 |
| 10 | Reframe hero lead paragraph from product self-description to visitor orientation | G1 | TRIM (copy) | 5 |

---

## Section 9 — Handoff notes

**For dataviz / chart work:**  
The BandDistributionBar component already exists and is used in both the home page small-multiples section and IndexHero. Passing `index={slug}` renders per-index data. Adding this component to each /indexes card requires no new data — all JSON files are already loaded by EntitySearch at page mount. The question for implementation is whether to load them at card-render time (SSG-friendly, recommended for static export) or defer to the EntitySearch client load.

**For copy / knowledge-architect:**  
Two specific copy problems to address: (1) the hero lead paragraph is institutional self-description rather than visitor orientation — rewrite for "you're here because you want to compare institutions; here's how to start"; (2) the "How to use the indexes" panel rows need a methodology row and the redundant "Browse rankings" row removed.

**For QA:**  
- Verify all 7 indexes appear in the card grid (currently only 5 non-featured + Countries featured = 6, with Assess Your Org as card 7 — U.S. Cities and Global Cities are absent)
- Verify PickEntityCallout visibility requires `#pick-entity-to-watch` hash (should be invisible on direct /indexes navigation)
- Verify entity search loads all 1,155 entities before accepting input (disabled state tested)

---

## Section 10 — Assumptions

1. The home page's band distribution bars use the same BandDistributionBar component and the same JSON data as EntitySearch — adding them to /indexes cards is low implementation risk.
2. The daily briefing data (`updates/latest.json`) is already imported in `page.tsx` for the home page and requires the same import pattern on /indexes if a briefing strip is added.
3. "U.S. Cities" and "Global Cities" are confirmed complete indexes (144 and 250 entities respectively, per CLAUDE.md) — their absence from the /indexes grid appears to be an omission, not a deliberate editorial decision.
4. The page section labeled "Current indexes" is intended to show all 7 published index families, not a curated subset.
