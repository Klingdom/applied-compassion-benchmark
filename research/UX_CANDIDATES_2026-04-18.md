# UX Candidates — Conversion Audit
**Date:** 2026-04-18
**Auditor:** UX Designer agent
**Scope:** LinkedIn-post-to-Gumroad-purchase conversion path; /updates → entity context → purchase

---

## Audit Method

Read the following files in full:
- `site/src/app/page.tsx`
- `site/src/app/updates/page.tsx`
- `site/src/app/updates/[date]/page.tsx`
- `site/src/components/updates/DailyBriefing.tsx`
- `site/src/app/fortune-500/page.tsx`
- `site/src/app/purchase-research/page.tsx`
- `site/src/components/index/RankingTable.tsx`
- `site/src/components/purchase/ResearchConfigurator.tsx`
- `site/src/components/ui/NewsletterSignup.tsx`
- `site/src/data/gumroad.ts`
- `site/src/data/updates/daily/2026-04-18.json` (sample)

---

## Scoring Rubric

Each candidate is rated 1–5 on six dimensions. Higher is better for Impact, Strategic Alignment, Learning Value, and Confidence. Lower is better for Effort and Risk.

**Priority Score formula:** `(Impact + Strategic Alignment + Learning Value + Confidence) - (Effort + Risk)`

Maximum possible: 14. Minimum: -6.

---

## Candidate 1: Score Change Cards Link to the Ranking Page

### Friction Point

In `DailyBriefing.tsx`, every score change card has `id={change.slug}` set on its wrapper div. The entity name (`change.entity`, e.g. "Ford Motor") is rendered as plain `<h3>` text. There is no link on the card — not to the ranking index page, not to the entity's row in that table, and not to a purchase CTA scoped to that entity's index.

The data model includes `change.index` (e.g. `"fortune-500"`) and `change.slug` (e.g. `"ford-motor"`). The routing for the index page already exists at `/fortune-500`. The ranking table already supports search by name and has an `id` per row key (`entry.rank`). The pieces exist — they are not connected.

A LinkedIn visitor who reads "Ford Motor downgraded" has one question: where does Ford sit in the full list, and who else is near it? Currently there is no way to answer that from the briefing card.

### Proposed Fix

In `DailyBriefing.tsx`, wrap `change.entity` in a `<Link>` that routes to `/${change.index}?search=${change.slug}`. For the Fortune 500 specifically that becomes `/fortune-500?search=ford+motor`. The `RankingTable` already has a `search` input — add a `useSearchParams` read on mount to pre-populate it (one `useEffect`, no API changes). This is a pure front-end wiring task.

Optionally, add a secondary inline link "View in full index →" below the evidence record in each card.

### Expected Conversion Mechanism

The visitor sees the downgrade, wants context ("how bad is this vs. peers?"), clicks through to the ranking page, sees Ford at rank 312 of 447 in the Developing band surrounded by peers with similar scores, and is now looking at the full table. The in-table purchase CTA at row 50 and the page-level Gumroad button are then in natural view. This is the core "browse → purchase" funnel step that is currently missing.

### Ratings

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |

**Priority Score: 15** (capped at 14 by rubric; top priority)

---

## Candidate 2: Entity-Scoped Purchase CTA on Score Change Cards

### Friction Point

The DailyBriefing has two generic purchase CTAs: a `<Callout>` midpage ("Get the full benchmark report") and one at end-of-page ("Want the complete picture?"). Both link to `/purchase-research` generically, which then requires the user to navigate the `ResearchConfigurator` to find the right index.

When a user is reading a Ford Motor downgrade card, the purchase intent is scoped to the Fortune 500 report — not the full catalog. Sending them to a generic configurator adds 3–4 decision steps (year, area, format, license) before they reach the Gumroad checkout. Each step adds abandonment opportunity.

`gumroad.ts` already has `fortune500Index`, `aiLabsIndex`, `countriesIndex`, `roboticsIndex`, and `globalCitiesIndex` keyed. `DailyBriefing.tsx` already has `change.index` per card. There is a direct mapping available.

### Proposed Fix

Build a `gumroadByIndex` lookup (parallel to `gumroadMap` already in `ResearchConfigurator.tsx`) inside `DailyBriefing.tsx`:

```ts
const gumroadByIndex: Record<string, string> = {
  "fortune-500": GUMROAD.fortune500Index,
  "ai-labs": GUMROAD.aiLabsIndex,
  "countries": GUMROAD.countriesIndex,
  "robotics-labs": GUMROAD.roboticsIndex,
  "global-cities": GUMROAD.globalCitiesIndex,
};
```

Within each score change card, render a small inline CTA below the evidence record:

```
[Get the Fortune 500 Index Report — $195 →] (Gumroad direct)
```

Only render this if a Gumroad URL exists for `change.index`. If not, render a "View full index" link instead. This replaces zero existing elements — it is additive.

### Expected Conversion Mechanism

The user finishes reading the evidence trail for a specific entity, already convinced the research matters, and sees a single-step purchase path for the exact product relevant to what they just read. No configurator friction, no catalog scanning. The distance between "convinced" and "checkout" shrinks from 4 decisions to 1 click.

### Ratings

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority Score: 14**

---

## Candidate 3: Newsletter CTA Appears Before the Score Change Cards, Not After

### Friction Point

In `DailyBriefing.tsx`, the inline newsletter nudge (variant: `"inline-compact"`) appears after all score change cards are rendered, inside a `<div className="mt-6 ...">` at the bottom of the score movements section. The full-card newsletter (`variant="card"`) appears after the Key Highlights section — which is several sections further down the page.

A LinkedIn visitor who clicked through from a "Target downgraded" post is at peak engagement at the moment they land: they came for one entity, they find a dossier format with evidence records. That engagement peak happens at the top of the page, not after they've scrolled past the score cards, source intelligence, purchase CTA, confirmations table, and key highlights.

The current placement captures users who are still reading after all of that. Most LinkedIn-sourced visitors will not scroll that far on a first visit.

The newsletter is the right activation for visitors who are not ready to purchase. It is the only re-engagement mechanism the site has. It should be positioned where it will be seen by the majority of visitors, not the most engaged minority.

### Proposed Fix

Add a second newsletter signup — variant `"inline-compact"` with `source="updates-hero"` — in the briefing hero section, directly below the four pipeline stats (`entitiesScanned`, `entitiesAssessed`, etc.) and above the band-change alert. This is a single `<NewsletterSignup>` insertion in the hero div in `DailyBriefing.tsx`. No layout changes required.

The copy at this placement should be reframed from "These findings arrive in your inbox every Monday" (current) to something like: "Get these briefings free every Monday." That reframes it from feature description to value offer at the moment of peak curiosity.

Keep the existing inline-compact placement after score cards as a secondary catch.

### Expected Conversion Mechanism

LinkedIn visitor lands, reads the hero, sees the stats, notices the band change alert, and before scrolling into the cards sees a frictionless email field. The cost is one field and a button. The value is explicit. This captures activation before the visitor decides whether to keep scrolling.

### Ratings

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 1 |

**Priority Score: 15**

---

## Candidate 4: Deep-Link Anchor Support for Entity Score Cards (LinkedIn Share)

### Friction Point

Score change cards in `DailyBriefing.tsx` already have `id={change.slug}` set on their wrapper div. This means a URL like `/updates#ford-motor` would scroll directly to the Ford Motor card on page load — but this only works if the browser receives that hash in the URL and the element is in the DOM when it loads.

There is no UI surface that makes this linkable. The entity name has no "share this" affordance. A LinkedIn user who wants to share the Ford Motor downgrade specifically has no way to construct or copy a direct link to that card. They can only share the briefing page URL, which opens at the top and requires the recipient to scroll to find the entity.

For a product whose primary discovery channel is LinkedIn, individual entity shareability is a direct traffic multiplier. Each share is a new potential entry point for the conversion funnel.

### Proposed Fix

Two changes:

1. In each score change card header, add a small copy-to-clipboard button (icon only, no label) that copies `${window.location.origin}/updates#${change.slug}` to clipboard. Show a brief "Copied" confirmation inline. This is a small `"use client"` component or a button with `navigator.clipboard.writeText()`.

2. Alongside the copy button, add a LinkedIn share link:
```
https://www.linkedin.com/sharing/share-offsite/?url=https://compassionbenchmark.com/updates/{date}#{slug}
```
Render as a LinkedIn icon button (`target="_blank"`, `rel="noopener"`). This is a static `<a>` tag — no framework complexity.

For archive pages (`/updates/[date]`), use the date-specific URL so the share always points to the correct briefing.

### Expected Conversion Mechanism

Each person who shares a specific entity's downgrade creates a new entry point. That entry point lands directly on the entity card (via hash scroll), pre-contextualized. The recipient sees exactly what was shared, has the newsletter signup and purchase CTAs in full context, and is more likely to convert than a cold homepage visitor.

This is the only candidate that operates outside the current session — it generates future traffic.

### Ratings

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 2 |

**Priority Score: 12**

*Note: Confidence rated 3 rather than 4 because hash-scroll on static export requires verification that Next.js handles `#fragment` routing correctly on the statically generated `/updates` page. Test before shipping.*

---

## Candidate 5: Purchase Page — Show What Is in the Report Before Asking for $195

### Friction Point

The `/purchase-research` page has five self-serve index report cards, each with a direct "Purchase — $195" Gumroad button. Each card has a 1–2 sentence description ("447 major U.S. corporations benchmarked on workforce, governance, and societal impact"). There is no preview, no table of contents, no sample page, and no list of what the report specifically contains beyond the generic format/license table.

The `ResearchConfigurator` shows format descriptions ("Professionally formatted benchmark report for standard review and internal reading") but no content preview.

A visitor who has just read a downgrade briefing knows the public score. What they do not know is: what does the PDF actually contain that the free website does not? The purchase decision is unsupported. "All 40 subdimension scores" is mentioned in two generic CTAs in `DailyBriefing.tsx` but this is not surfaced on the purchase page in any structured way.

This is the most common reason for abandonment on a $195 digital product with no return policy: the buyer cannot see what they are buying.

### Proposed Fix

Add a "What's in this report" expandable section to each index report card on `/purchase-research`. This is a static accordion (no API, no data fetch) with a fixed list of report contents per index. Minimum viable content:

- Section list (e.g.: Executive Summary, Methodology, Full Rankings, Dimension Breakdowns, Sector Analysis, Key Findings, Band Distribution, Top 25 / Bottom 25 tables)
- One concrete stat about depth (e.g. "Includes all 40 subdimension scores for 447 companies")
- Explicit statement of what the free site does not include (e.g. "Public site shows composite scores only; report includes all 8 dimension scores and methodology rationale per entity")

A secondary improvement: add a single representative sample image or table excerpt from an actual report (a screenshot with a watermark is sufficient). This is a content production task, not an engineering task.

The configurator panel should also show a "Report includes:" bullet list for the selected format, replacing or supplementing the current single-sentence `descriptionMap` value.

### Expected Conversion Mechanism

The visitor understands what differentiates the $195 purchase from the free site. The 40-subdimension breakdown is a genuine differentiation — a curious visitor who just read a downgrade card wants to understand which specific dimensions drove the score. Showing that the report answers that question is the strongest available conversion argument and it is currently invisible at the point of purchase.

### Ratings

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |

**Priority Score: 12**

---

## Priority Summary

| # | Candidate | Priority Score | Effort | Notes |
|---|---|---|---|---|
| 3 | Newsletter CTA in hero position | 15 | 1 | Highest reach, one-line insertion |
| 1 | Score change cards link to ranking page | 15 | 2 | Core funnel step, data already exists |
| 2 | Entity-scoped Gumroad CTA on score cards | 14 | 2 | Removes 4 decision steps at peak intent |
| 4 | LinkedIn share / deep-link per entity | 12 | 3 | Traffic multiplier, verify hash routing first |
| 5 | Report content preview on purchase page | 12 | 3 | Requires content production, high value |

---

## Assumptions and Open Questions

1. **No entity detail pages exist.** There are no routes under `/fortune-500/[slug]` or `/ai-labs/[slug]`. The `RankingTable` rows have no click handler and no `href`. Candidates 1 and 2 work around this by linking to index pages. If entity detail pages are built in a future sprint, the CTA architecture in Candidates 1 and 2 should be upgraded to link directly to entity pages.

2. **`?search=` query param pre-population in RankingTable is not yet implemented.** `RankingTable` initializes `search` state from `useState("")`, not from `useSearchParams`. Candidate 1 requires a one-time change to read from the URL. This is low-risk but must be done as part of the candidate — the link from the briefing card is useless if the table does not respond to it.

3. **Hash-scroll on static export.** Candidate 4 relies on `id={change.slug}` anchor scroll. This works in browser but needs testing in the Next.js static export context to confirm that `#fragment` navigation does not produce a 404 or reload. No code change is required for the anchor itself — only the share URL construction needs care.

4. **Gumroad coverage gaps.** `gumroad.ts` has no entries for `us-states` or `us-cities`. Candidates 2's lookup correctly skips those. If those products are listed on Gumroad, add them to `gumroad.ts` and the lookup will work automatically.

5. **The ResearchConfigurator defaults to "World Countries Index" and "Individual License."** A visitor arriving from a Fortune 500 briefing who navigates to `/purchase-research` will see the wrong index pre-selected. The configurator does not read URL params. A minor improvement (out of scope here) would be to accept a `?area=fortune500` param on the purchase page and use it to initialize the configurator.
