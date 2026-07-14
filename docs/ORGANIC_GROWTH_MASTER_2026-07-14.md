# Organic Growth (SEO + AEO) — Master Prioritized Recommendations

**Date:** 2026-07-14 · **Owner:** Coordinator · **Status:** Prioritized recommendations for founder review — NO implementation yet.
**Inputs (5 parallel lenses):**
- `docs/ORGANIC_GROWTH_SEOAEO_2026-07-14.md` (seo-aeo-architect — page architecture + technical + AEO)
- `docs/ORGANIC_GROWTH_PERSONAS_2026-07-14.md` (growth-strategist — persona/use-case pages)
- `docs/ORGANIC_GROWTH_PRODUCT_2026-07-14.md` (product-manager — new indexes/briefings/products)
- `docs/ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md` (competitive-researcher — demand + citation landscape, web)
- `docs/ORGANIC_GROWTH_CONTENT_2026-07-14.md` (knowledge-architect — cited content formats/explainers)

---

## 1. Strategic thesis (where all 5 lenses converge)

**Compassion Benchmark already owns an uncontested category — it just hasn't built the pages to capture it.** Live checks (2026-07-14) confirmed that *"most compassionate companies/countries 2026"* is held entirely by **adjacent** constructs (Newsweek Most Charitable, Ethisphere Most Ethical, Great Place to Work, a 2016 WEF empathy index) — **nobody measures institutional compassion.** The growth play is not new writing; it's:

1. **Promote owned assets into standalone, answer-first, schema-marked pages** (the 8 dimensions / 40 subdimensions / ~60 glossary terms are trapped in tooltips today; superlative rankings exist but aren't titled/structured for the query).
2. **Win the AEO/GEO citation lane** — the site already emits per-entity structured JSON that **no competitor** (Ethisphere/RepTrak/JUST/WBA/Princeton Review) exposes; add FAQ/DefinedTerm schema + `sameAs` + answer-first first-200-words.
3. **News-jack live cycles** the Daily Briefing is built for (FLI AI-Safety Index broke Jul 7-8; EIU Liveability; Ethisphere PR cycle).
4. **Own two categories with zero incumbent authority: AI-lab and humanoid-robot ethics/compassion.**

All of this is nonprofit-safe and reinforces independence (see guardrails, §5).

---

## 2. THE PRIORITIZED LIST (consolidated, ranked)

Priority = Impact + Confidence − Effort (from the lens scores), then sequenced by dependency. Grouped into waves.

### WAVE 1 — AEO foundation + quick wins (low effort, high yield, no product decision)

| # | Recommendation | Lens | Impact | Effort | Why now |
|---|---|---|:--:|:--:|---|
| **G1** | **`noindex` + canonical the new `/nonprofit-alt/*` pages** until cutover | SEO | 4 | 1 | They're a 9-page duplicate-content collision with the live pages **right now**. Ship before/with the deploy. Pure hygiene. |
| **G2** | **FAQPage schema** on entity + index + hub pages (real-data Q&A; no component exists today) | SEO R2 · Content | 5 | 2 | Biggest single AEO miss. Wins AI-Overview / Perplexity Q-blocks. |
| **G3** | **Superlative titles + H1 ×8 hubs** → "Most & Least Compassionate [Category] 2026" (only `/countries` has the answer block today) | SEO R7 | 5 | 2 | Captures the exact uncontested head query on pages that already rank. |
| **G4** | **Sitemap remediation** — prune ~10 dying commercial routes (pre-404), ADD orphaned special briefings + `/data` + `/media`, ship Nginx 301s | SEO R6 | 4 | 2 | Special reports are currently invisible to search; commercial routes will 404 on cutover. |
| **G5** | **`/glossary` + `/dimensions` hub + 8 dimension pages** (40 subdims as anchored sections, NOT thin pages) — renders verbatim from `dimensions.ts`/`glossary.ts` | Content C1/C2 | 5 | 3 | Opens the uncontested **DefinedTerm** citation lane AND **fixes a live bug**: `glossary.ts` links to `/dimensions`, which currently 404s. |
| **G6** | **Reposition `/self-assessment`** as "Measure your organization" (title/meta/intent) — tool already exists | Personas #4 | 3 | 1 | Near-zero build; captures corporate-sustainability search intent. |
| **G7** | **`/cite` standalone page** (currently buried inside `/media`) | Personas #2 | 3 | 1 | Owns "how to cite [X] compassion score"; feeds the citation flywheel. |

### WAVE 2 — New page types & persona hubs (medium effort, high yield)

| # | Recommendation | Lens | Impact | Effort | Notes |
|---|---|---|:--:|:--:|---|
| **G8** | **Region superlative sub-hubs** (`/countries/region/<region>`, cities/regions) — ~templatable from `metadataFields` | SEO R1 | 4 | 3 | Region facets ship now (data clean). **F500 sector hubs are BLOCKED on a data fix — see G16.** |
| **G9** | **Comparison / "vs" pages** — start with **AI chatbot safety** ("ChatGPT vs Claude vs Gemini safety") where incumbents are low-authority SEO farms | Competitive #3 · Personas | 5 | 3 | Strong Perplexity/AI-Overview citation candidate; maps to Boundaries/Equity/Awareness. |
| **G10** | **AI-Governance Research Hub** + reposition AI Labs index as **"beyond safety: institutional compassion of AI labs"** (news-jack FLI Summer-2026 index) | Personas #3 · Competitive #1 | 5 | 3 | Unique 12-18mo moat — no ESG incumbent scores AI labs. Immediate news hook. |
| **G11** | **`/for-journalists`** (split from merged `/media`; forward-watch/embargo/RSS framing) | Personas #1 | 4 | 2 | Journalists are the amplifier for every other persona. |
| **G12** | **Pillar pages:** "What is institutional compassion?" + "How to read a compassion score" | Content C3/C4 | 4 | 3 | Head-term / entity-defining pages a Wikidata node + press anchor to. |
| **G13** | **Seed `sameAs` for the 967 non-country entities** | SEO R3 | 4 | 3 | #1 AEO leak ×967 — engines can't bind "Meta's compassion score" to the entity. Sidecar pipeline already ships → verification-bound, not engineering-bound. |
| **G14** | **"Cited By" showcase page** (honest, no fabricated citations) + **badge/embed** citation flywheel | Personas | 3 | 2 | Compounding backlink/authority loop. |

### WAVE 3 — New content products, indexes & briefings (bigger bets)

| # | Recommendation | Lens | Impact | Effort | Notes |
|---|---|---|:--:|:--:|---|
| **G15** | **Monthly "Biggest Movers" digest** — fully automated from existing score-change data | Product | 5 | 2 | Strongest recurring freshness/citation signal for least effort. Best big-bet ROI. |
| **G16** | **Fortune 500 `sector` field normalization** (truncated/inconsistent: "Financial Servi", "Aerospace/Defen", "Finance" vs "Financials") | SEO (blocker) | 4 | 2 | **Unblocks G8 sector hubs** + sector briefings. Data-quality fix. |
| **G17** | **Special Briefings** (news-citable launches): "The Extractive Discount" (F500 sector-mean, zero new evidence) → "What It Takes to Hit the Floor" (atrocity-finding taxonomy) → "The Downgrade Arc" | Product · Content C10 | 4 | 3 | 6-briefing editorial calendar in the product doc. Extractive Discount ships fastest. |
| **G18** | **Robotics Labs "ethics ranking" positioning + pages** — category has **zero incumbent authority** | Competitive #2 | 4 | 3 | Diff 1 / Opp 5 — claim it before anyone else does. |
| **G19** | **New Index: Hospitals & Health Systems** — best University-Index analog (mass "is my hospital safe" demand; CMS/Leapfrog/OSHA/NLRB/990 evidence; sequel to "The Denial Machine") | Product (top index) | 5 | 5 | The big swing. Reuses the deterministic pipeline. **Scope trap flagged:** airlines/pharma/insurers/retailers/energy are already IN F500 → do those as briefings, not indexes. |
| **G20** | **ESG-independence comparison content** — "Ethisphere alternative", "is [ranking] pay-to-play", "issuer-pay ESG vs evidence-linked scoring" | Competitive #4/#5/#6 | 4 | 3 | Rides a live, regulator-validated (EU 2026) objection; strong AI-citation candidate; on-brand for independence. |

---

## 3. Cross-lens conflicts resolved

- **Glossary/dimension pages:** SEO rejected "40 thin subdimension pages"; content proposed a glossary/dimensions build. **Resolution (G5):** build `/glossary` + `/dimensions` hub + **8** dimension pages with the 40 subdims as **anchored sections** (not standalone) — satisfies both, and fixes the live `/dimensions` 404.
- **"How compassionate is X?" pages:** SEO flagged these as thin/duplicative of existing entity pages. **Resolution:** don't build a separate page type — optimize existing entity pages with FAQ (G2) + `sameAs` (G13) instead.
- **`ClaimReview` schema:** **Rejected** (misrepresents assessments as fact-checks — independence risk for a nonprofit). Use Dataset/ItemList/DefinedTerm/FAQPage instead.
- **`/nonprofit-alt` mirror:** the new pages are a duplicate-content risk → **G1 (`noindex`+canonical) is mandatory** and should ship immediately.

## 4. Recommended sequencing

```
Wave 1 (ship with / right after the pending deploy): G1 → G2, G3, G4, G6, G7 → G5
Wave 2 (new pages): G9, G10, G11 (persona+AEO capture) · G13 (sameAs) · G8 after G16 · G12, G14
Wave 3 (products): G15 (biggest movers) + G17 (Extractive Discount) first · G16 unblocks G8/sector briefings ·
        G18/G20 positioning · G19 (Hospitals Index) as the flagship swing
```
**Dependencies:** G8 → G16 · everything indexation-facing → G1 first · G13 uses the existing sidecar pipeline.

## 5. Guardrails (independence — non-negotiable)

- **No pay-for-ranking optics.** Every page is a restatement of published, evidence-linked scores. Reject `ClaimReview`.
- Reuse the independence claim as a repeated, citable on-page line (competitive lens): *"no entity we score can pay for inclusion, a higher score, or suppression of findings — every Fortune 500 company is scored, not just those who apply."*
- New indexes/briefings must run through the **deterministic pipeline** (scanner→assessor→digest, human-approved) — no shortcut scoring.
- AEO structure: lead every new page with a **direct, quotable answer in the first ~200 words**; expose per-entity structured data (the durable edge no competitor has).

## 6. Implementation discipline

Nothing here is approved to build yet. When you select items, each ships as its own validated change (tsc clean · `validate-indexes` unchanged · build page-count = baseline + exactly the new routes · no `gumroad` imports · sitemap/schema validated). New indexes/briefings follow the University-Index lifecycle (PRD → pipeline scoring → assembly → wiring → SEO).

*Consolidated from 5 independent specialist lenses, 2026-07-14.*
