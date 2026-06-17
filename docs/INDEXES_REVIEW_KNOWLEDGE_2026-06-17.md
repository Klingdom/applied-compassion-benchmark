# Indexes Hub — Knowledge-Acquisition Review

**Surface:** `site/src/app/indexes/page.tsx` (the hub routing to 7 index pages) + the teaching primitives it could reuse.
**Reviewer lens:** Knowledge Architect — what does the visitor LEARN? Three goals: (1) knowledge acquisition, (2) understanding the methodology, (3) discovering the daily briefing.
**Date:** 2026-06-17
**Mode:** Review only. No code modified.

---

## Lead finding — the single highest-leverage knowledge move

**The `/indexes` hub teaches nothing about how to read a benchmark, and the project already owns the parts to fix it.** A first-time visitor who lands here learns the names of some indexes and is offered five ways to pay — but never learns what a compassion *score*, *band*, or *dimension* is, that all 1,155 entities are measured on the *same* 8-dimension / 0–100 / 5-band ruler, or that a *daily briefing* exists. Three reusable, already-shipped components carry exactly this knowledge: `ScoreLegend` (`charts/ScoreLegend.tsx`), `DimensionLegend` (`index/DimensionLegend.tsx`), and `BandDistributionBar` (`charts/BandDistributionBar.tsx`, with an `index="all"` aggregate mode). **None of them appears on the hub.** Dropping a "How to read every index" teaching block (ScoreLegend + DimensionLegend + the all-index BandDistributionBar) high on the page — paired with framing that these are the *same ruler* across all 7 indexes — is the one change that converts the hub from a product catalog into a teaching surface. It directly serves Goal 1 and Goal 2 at once, and it is near-zero-effort because the components already exist and pull from the canonical `dimensions.ts`.

---

## The 5s → 30s → 3min ladder, as the page stands today

**5 seconds (scan).** The H1 (line 27) reads "Explore benchmark rankings across governments, corporations, AI, and robotics." Clear *that* there are rankings; silent on *what is being ranked for* (the word "compassion" never appears in the H1, sub-deck, or hero stats). The most prominent secondary element is the "How to use the indexes" table (lines 45-72), whose rows are 4/5 commercial ("Buy the first published report," "License data," "Advisory," "Certified review"). First impression: a paid research store, not a public benchmark you can learn from.

**30 seconds (orient).** The reader hits the Entity Search (good — concrete, line 84), then a full "Featured launch" buy block (lines 91-131), then a "Public benchmark first. Premium depth." callout (lines 136-141), *before* reaching the actual list of indexes (line 153). The reader has now seen the $195 product twice and the independence policy once, but still does not know what an index measures or how the score works.

**3 minutes (comprehend).** The index grid (lines 153-178) finally names the families. But: (a) it lists only **6 cards** — Countries, U.S. States, Fortune 500, AI Labs, Robotics Labs, plus "Assess Your Organization" — and **omits U.S. Cities and Global Cities entirely**, contradicting the hero's "7 published index families" (line 38) and the search's "1,155 entities across... cities" (line 82); (b) each card describes its *domain* but none teaches the *shared schema*; (c) below the grid the reader gets the funding panel, the independence panel, and a 6-card "Go deeper with products" grid. **At no point does the page explain a band, a dimension, or the 0–100 scale, and at no point does it link to the daily briefing.**

**Deep.** Methodology appears exactly once, as a dot-separated text link in the closing nav row (line 245), with equal visual weight to "Contact Sales." The daily briefing (`/updates`) appears **zero times** in the page body.

---

## Cross-cutting diagnosis

- **Jargon/acronym debt is unpaid here.** "Full public institutional compassion framework" (line 161), "accountability, safety posture, deployment boundaries, equity, and integrity" (line 166) — these are dimension names and framework terms used as if already known. The hub never decodes them, even though `DimensionLegend` exists precisely to decode AWR/EMP/ACT/... in ≤6 words.
- **The comparability story — the most teachable insight on the whole site — is never told.** The single most interesting thing about this benchmark is that a country, a Fortune 500 company, and an AI lab are scored on the *same* 8 dimensions, so cross-type comparison is meaningful. The hub treats the 7 indexes as 7 unrelated products rather than 7 cuts of one ruler.
- **Attention budget is spent on conversion, not comprehension.** Of ~8 sections, 5 are commercial (hero CTA row, Featured launch, Premium-depth callout, funding panel, Go-deeper grid, closing trust line). This is conversion-strategist territory; from a knowledge lens it crowds out the germane load. (Handoff: prioritization of commercial vs. teaching sections is a conversion-strategist + UX call — I flag only the comprehension cost.)
- **The individual index pages are far better teachers than their own hub.** `/countries` (countries/page.tsx) leads with an answer-first sentence ("X is the most compassionate... Y the least... across 8 dimensions"), renders `IndexHero` with a live `BandDistributionBar`, and `IndexPageCharts` with top-5/bottom-5 + group means. The hub that *routes* to these pages has none of this scaffolding — the funnel is upside down (depth lives at the leaves, not the trunk).

---

## Ranked candidates

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.

### 1. Add a "How to read every index" teaching block near the top — `[Goal 1 + Goal 2]`
- **Pages:** `/indexes`
- **Problem:** The hub never defines score / band / dimension. The reader must leave for `/methodology` (linked only once, at the very bottom, line 245) to learn how to read anything they're about to click. Comprehension cost: every index card and the entire search result UI (which shows composite + band, EntitySearch.tsx lines 214-227) is unreadable to a newcomer.
- **Proposed change:** Insert a section directly after the hero (before or fused with Entity Search) containing: a one-sentence framing ("Every entity below — country, company, AI lab, city — is scored 0–100 on the same 8 dimensions and placed in one of 5 bands"), then `<DimensionLegend />` (the 8-code colored strip), then `<ScoreLegend />` (the closed-by-default "How to read the scores" disclosure with bands + dimension glossary). Both already pull from canonical `dimensions.ts`/`BANDS`.
- **KA benefit:** After 30s the reader can decode AWR/EMP/... and read any score+band in search results and on every index page. Schema is taught once, reinforced everywhere (progressive disclosure: strip = scent, ScoreLegend = depth on demand).
- **Independence check:** PASS — ScoreLegend's footer already states "Entities never pay for inclusion."
- Impact 5 · Strategic 5 · Learning 5 · Confidence 5 · Effort 1 · Risk 1 → **Priority 18**

### 2. Add the all-index Band Distribution bar as a "state of the field" hook — `[Goal 1 + Goal 2]`
- **Pages:** `/indexes`
- **Problem:** The hub's hero stats (lines 37-42) are structural ("7 families," "1,155 entities," "Public + Premium") — none conveys a *finding*. A benchmark hub with no headline number gives the scanner nothing to remember.
- **Proposed change:** Add `<BandDistributionBar index="all" />` in the hero's right column (replacing or augmenting the commercial "How to use" table), with a one-line dek like "Across all 1,155 benchmarked entities, here's how compassion is distributed." This is the same component IndexHero uses per-index; `index="all"` is already supported.
- **KA benefit:** Gives the page a single memorable, evidence-first stat (e.g. "most entities sit in Developing/Functional, few are Exemplary"), teaches the band vocabulary visually, and models the legend the reader will see on every index page. A concrete retention hook before any abstraction.
- **Independence check:** PASS — pure distribution of published data; the bar carries the CC-BY caption.
- Impact 4 · Strategic 4 · Learning 5 · Confidence 5 · Effort 1 · Risk 1 → **Priority 16**

### 3. Make the daily briefing a first-class on-ramp on the hub — `[Goal 3]`
- **Pages:** `/indexes`
- **Problem:** `/updates` (the daily briefing) appears **nowhere** in the page body (confirmed by grep). The only path is the global navbar. A visitor who arrives at the indexes hub via search/SEO has no idea a daily briefing exists — Goal 3 is currently served at 0%.
- **Proposed change:** Add a compact "Today on the benchmark" card/strip (e.g. near the index grid or in the closing panel) that links to `/updates` with a one-line description of what the daily briefing is ("Each day we publish score movements, boundary watches, and the brutal insight of the day across all indexes"). Optionally surface the latest briefing date. Give Methodology and Daily Briefing equal, prominent placement rather than burying both in the line-245 dot list.
- **KA benefit:** The reader learns the benchmark is *living* (daily), not a static 2026 snapshot, and gets a recurring re-entry point. Connects the static rankings to the ongoing narrative.
- **Independence check:** PASS — editorial briefing, no commercial gating implied.
- Impact 4 · Strategic 5 · Learning 4 · Confidence 5 · Effort 2 · Risk 1 → **Priority 15**

### 4. Fix the index grid: show all 7 indexes + teach the shared-ruler story — `[Goal 1]`
- **Pages:** `/indexes`
- **Problem:** The "Current indexes" grid (lines 153-178) shows 6 cards and **omits U.S. Cities and Global Cities**, directly contradicting "7 published index families" (line 38) and the search scope (line 82). Beyond the count bug, each card sells its domain but none states the comparability premise. The reader cannot discover where to start because the cards aren't differentiated on a learnable axis (size, what's distinctive, why you'd pick it).
- **Proposed change:** (a) Add U.S. Cities and Global Cities cards so the grid matches the stated 7. (b) Add a one-line preamble to the grid: "All seven indexes share the same 8-dimension framework, so scores are comparable across types." (c) On each card, add a single scannable differentiator — entity count and/or the index mean band (e.g. "207 entities · field skews Developing") so the reader can choose by scent. (d) Consider moving "Assess Your Organization" out of the *indexes* grid (it is a service, not an index) to avoid teaching a false mental model that self-assessment is the 6th index.
- **KA benefit:** Reader leaves knowing exactly how many indexes exist, that they're mutually comparable, and which to open first based on a real attribute — not guesswork.
- **Independence check:** PASS.
- Impact 4 · Strategic 4 · Learning 4 · Confidence 5 · Effort 2 · Risk 1 → **Priority 14**

### 5. Rewrite the hero so the 5-second scan says what is measured — `[Goal 1]`
- **Pages:** `/indexes`
- **Problem:** The H1 (line 27) and sub-deck (line 30) never say the word "compassion" or what the score means; the deck is positioning copy ("public-facing core of the platform... comparative starting point for deeper analysis"). The most prominent supporting element is a commercial "How to use" table. The 5-second test fails on *substance*: a scanner learns there are rankings and products, not what is benchmarked.
- **Proposed change:** Reframe the deck to lead with the conclusion/definition: e.g. "We score 1,155 institutions — countries, companies, AI labs, cities — on how well they recognize, respond to, and reduce suffering, across 8 dimensions on a 0–100 scale." Demote the commercial "How to use" table below the teaching block (candidate 1) or replace it with the band-distribution hook (candidate 2).
- **KA benefit:** The single most important idea (what this benchmark measures) becomes unmissable in the first scan; the reader can explain the page's point to someone else after 5 seconds.
- **Independence check:** PASS — definitional, evidence-first, no hype; "recognize, respond to, reduce suffering" mirrors the project's own framing.
- Impact 4 · Strategic 4 · Learning 4 · Confidence 4 · Effort 2 · Risk 2 → **Priority 12**

### 6. Decode framework jargon inline in the index card descriptions — `[Goal 1 + Goal 2]`
- **Pages:** `/indexes`
- **Problem:** Cards use undefined framework language: "full public institutional compassion framework" (line 161), "accountability, safety posture, deployment boundaries, equity, and integrity" (line 166), "labor, healthcare, accessibility, governance, and deployment risk" (line 167). These read as bespoke per-index criteria, which actively *miseducates* — it implies each index uses different dimensions, undercutting the comparability story.
- **Proposed change:** Normalize card descriptions so they reference the shared 8 dimensions (the framework is the same; only the *evidence sources* differ per type). E.g. AI Labs: "Scored on the same 8 dimensions, with evidence drawn from safety disclosures, deployment policy, and governance." Pairs with candidate 1's legend so the dimension names are now decodable.
- **KA benefit:** Removes the comprehension tax of undefined terms and reinforces (rather than contradicts) the one-ruler mental model.
- **Independence check:** PASS.
- Impact 3 · Strategic 3 · Learning 4 · Confidence 4 · Effort 2 · Risk 1 → **Priority 11**

### 7. Give Methodology a real on-ramp, not a footer-style text link — `[Goal 2]`
- **Pages:** `/indexes`
- **Problem:** Methodology — the second of three stated goals — appears once, as a 0.92rem dot-separated link among 8 equally-weighted links (line 245), visually indistinguishable from "Contact Sales." A reader who wants to know *how scores are derived* has no prominent path from the hub.
- **Proposed change:** Add a clear "How scoring works" prompt attached to the teaching block (candidate 1) — ScoreLegend already ends with a "Full methodology" link, so surfacing ScoreLegend largely solves this; additionally elevate a single explicit "Read the full methodology" button near the index grid rather than only in the closing dot row.
- **KA benefit:** The 5s→deep ladder gains a clean top rung to methodology; the reader who wants rigor finds it without scanning the footer.
- **Independence check:** PASS.
- Impact 3 · Strategic 4 · Learning 3 · Confidence 4 · Effort 1 · Risk 1 → **Priority 12**

### 8. Rebalance section order so teaching precedes selling — `[Goal 1, structural]`
- **Pages:** `/indexes`
- **Problem:** The reader meets the $195 Featured-launch block (lines 91-131) and the "Premium depth" callout (lines 136-141) *before* the list of indexes and before any explanation of what a score means. Extraneous (commercial) load is front-loaded; germane (comprehension) load is deferred or absent.
- **Proposed change:** Reorder to: Hero (with what-is-measured deck + band hook) → Teaching block → Entity Search → Index grid (all 7) → Daily briefing on-ramp → *then* the commercial sections (Featured launch, Go-deeper grid) → independence/funding → closing nav. Keep all commercial content; move it after the reader understands what they're buying into. (Handoff: exact ordering vs. revenue goals is a conversion-strategist decision; I document only the comprehension cost of the current order.)
- **KA benefit:** The reader acquires the mental model before being asked to act on it; selling lands better *and* comprehension improves.
- **Independence check:** PASS — no content removed, only sequenced.
- Impact 3 · Strategic 3 · Learning 3 · Confidence 3 · Effort 2 · Risk 2 → **Priority 8**

---

## If you fix one thing

**Ship candidate 1: a "How to read every index" teaching block (DimensionLegend + ScoreLegend) high on the hub, framed as "the same ruler across all 7 indexes."** It is the highest-impact, near-zero-effort move because the components already exist, draw from canonical data, and simultaneously serve knowledge acquisition (Goal 1) and methodology understanding (Goal 2). It also makes every downstream surface — the entity search results, the index cards, and all 7 index pages — legible to a first-time reader who currently has no way to learn what a band or dimension is without leaving the page.

---

## Files referenced
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\indexes\page.tsx` (the hub under review)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\index\DimensionLegend.tsx` (reusable; `DIMENSION_MEANINGS`)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\ScoreLegend.tsx` (reusable; bands + dimension glossary + methodology link)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\BandDistributionBar.tsx` (supports `index="all"` aggregate)
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\dimensions.ts` (canonical `DIMENSIONS`, `BANDS`, `BAND_DESCS`, `INTEGRATION_PREMIUM`)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\index\EntitySearch.tsx` (shows composite+band with no on-page legend)
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\countries\page.tsx` + `site\src\components\index\IndexHero.tsx` + `IndexPageCharts.tsx` (the better-taught leaf pages the hub fails to match)
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\nav.ts` (`/updates` daily briefing exists in nav but not on the hub body)
