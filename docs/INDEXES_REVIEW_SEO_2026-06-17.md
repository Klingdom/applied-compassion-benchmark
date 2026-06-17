# /indexes Hub Review — SEO + AEO (2026-06-17)

**Scope:** `site/src/app/indexes/page.tsx` as a discovery/answer surface only. The 7 individual index pages already received superlative titles + answer-first blocks + FAQPage/Dataset/Breadcrumb JSON-LD in G1 (see `site/src/app/countries/page.tsx`). This review treats `/indexes` as the **hub** that should route both humans and answer engines to those 7 spokes + methodology + the daily briefing.

**Goals tagged throughout:** (1) knowledge acquisition · (2) methodology understanding · (3) path to the daily briefing.

**White-hat only.** Every recommendation restates real benchmark data; no fabricated counts, schema, or links.

---

## Verdict

`/indexes` is a well-built *sales/navigation* hub but a **weak discovery/answer surface**. It is the single page on the site whose whole job is to say "here is the set of 7 indexes and what makes this benchmark unique," yet it carries:

- a non-descriptive title (`"Indexes"`) — the weakest title of any major route,
- **zero JSON-LD** (no `CollectionPage`/`ItemList`, no `BreadcrumbList`, no `FAQPage`) while every spoke page has three schema blocks,
- **no extractable answer-first sentence** ("The Compassion Benchmark publishes 7 indexes covering N entities…"),
- **no link to the daily briefing (`/updates`)** — Goal 3 is entirely absent,
- a stale, machine-readable entity count (`1,155`) hardcoded in 3 places,
- the cross-type scope claim (govts + corps + AI/robotics labs + cities on one framework) present only as prose marketing, never as a crisp machine-legible statement.

It is the highest-leverage hub on the site and currently the least optimized. The fixes are low-effort because the reusable components already exist (`BreadcrumbJsonLd`, `FaqJsonLd`, `FaqAccordion` in `site/src/components/seo/`).

---

## Findings by layer

### A. On-page / title + description (Goal 1)
- **Title is `"Indexes"`** (line 15) → renders `Indexes | Compassion Benchmark`. This wins nothing. The hub query class is *"compassion benchmark indexes," "institutional compassion rankings," "compassion benchmark list of rankings."* Compare the spokes (`"Most & Least Compassionate Countries 2026 — Compassion Benchmark"`). The hub deserves an equally front-loaded title.
- **Description** is decent but leads with "Explore published…" rather than the citable fact. It also hardcodes `1,155` (stale — see F).
- **No `alternates.canonical`.** Spokes rely on `metadataBase` defaults; for the hub, an explicit self-canonical (`/indexes`) is cheap insurance against trailing-slash / `.html` duplication from static export.

### B. Internal-linking hub quality (Goals 1, 2, 3)
This is the page's core job and it is **incomplete**:
- **Only 6 of 7 index families are linked.** The "Current indexes" grid (lines 153-178) links Countries, U.S. States, Fortune 500, AI Labs, Robotics Labs — and then `/assess-your-organization` as the 6th card. **`/us-cities` and `/global-cities` are missing entirely** from the hub. Two real index families (144 + 250 entities) are orphaned from their own hub. This is both an SEO crawl-path gap and an AEO completeness gap (an engine reading this page would conclude the benchmark has 5 ranking families).
- **No link to `/updates`** (the daily briefing — confirmed route exists at `site/src/app/updates/page.tsx`). Goal 3 ("path to the daily briefing") is structurally missing. The hub should carry a "Latest briefing" link/section. This is also the freshness signal answer engines reward.
- **Methodology is linked only once**, in the small closing nav row (line 245), as bare anchor `Methodology`. For Goal 2, methodology deserves a prominent, descriptive link near the top ("How the 8-dimension compassion score is calculated") — not buried in a footer-style list.
- Anchor text on the index cards is good (descriptive names + one-line descriptions). The closing nav row (lines 244-260) uses plain `<a>` with single-word anchors ("Research", "Advisory") — acceptable for utility nav, but it dilutes the hub's primary purpose by mixing 8 commercial links with the discovery links.
- **`/data` vs `/data-licenses`:** the page links `/data-licenses` (the commercial page). The prompt references `/data`; confirm whether a raw-dataset/download surface exists. If a public dataset/download page exists, the hub should link it (it is the AEO "here is the dataset" path). If only `/data-licenses` exists, that is fine — note the gap for the dataset-distribution story.

### C. Structured data (the SEO↔AEO bridge — highest leverage)
- **The hub emits no JSON-LD at all.** The single most valuable addition: a **`CollectionPage` + `ItemList`** enumerating the 7 indexes (each `ListItem` → name + absolute URL + short description). This is the machine-legible "here are the 7 datasets this institution publishes" statement — exactly what Google Dataset Search and answer engines use to map the institution's coverage. Components to model it on: the spoke `DatasetJsonLd` already declares each index as a `Dataset`; the hub `ItemList` should point at those 7 URLs so engines connect hub→datasets.
- **`BreadcrumbList` missing.** Trivial add using existing `BreadcrumbJsonLd` (`Home › Indexes`). The spokes already declare `Indexes` as a breadcrumb parent pointing here — so engines expect this node to exist and self-describe.
- **`FAQPage` missing.** The hub is the natural home for the *cross-cutting* questions the spokes don't own: "What is the Compassion Benchmark?", "How many indexes are there / how many entities?", "What sectors does it cover?", "How is the compassion score calculated?" (link to methodology). Reuse `FaqJsonLd` + `FaqAccordion` exactly as the spokes do. **Real Q&A only**, answered from actual data.
- Consider referencing the `Organization`/`ResearchOrganization` (already in `layout.tsx`) as `isPartOf`/`publisher` on the CollectionPage so the hub binds to the institution entity.

### D. AEO / answer-first extractability (Goals 1, 3)
- **No extractable lead sentence.** The H1 ("Explore benchmark rankings across governments, corporations, AI, and robotics") is a marketing headline, not a copy-paste fact. An answer engine asked *"what is the Compassion Benchmark / what does it rank?"* finds no atomic, self-contained sentence to lift. Add one in the hero, e.g.: *"The Compassion Benchmark is the only benchmark that scores governments, corporations, AI labs, humanoid-robotics labs, U.S. states, and cities — [N] entities across 7 indexes — on one 8-dimension institutional-compassion framework."* (Restate real counts.)
- **Cross-type scope is the institution's strongest differentiator and it is not machine-legible.** "One framework across govts + corps + AI/robotics labs + cities" appears only as scattered prose. Make it ONE sentence (above) AND encode it in schema (`CollectionPage.description` + `ItemList`). This is the claim most likely to be cited verbatim.
- **No freshness signal.** No "last updated," no link to the dated daily briefing. Hubs that surface a current date + latest briefing read as live to answer engines; a static hero reads as stale.

### E. Crawlability / indexation
- Page is statically exported and indexable (inherits `robots: index, follow`). Good baseline.
- Confirm `/indexes` is in `sitemap.ts` (out of scope to fix here — flag for the technical pass).
- The two missing city indexes (B) mean the hub is not a complete crawl path to all 7 spokes; crawlers relying on the hub for discovery miss `/us-cities` and `/global-cities` unless reached via nav/sitemap.

### F. Data freshness / accuracy (independence + trust)
- **Entity count `1,155` is hardcoded in 3 places** (lines 15, 39, 82) and as `"7"` index families (line 38). The current CLAUDE.md data notes imply a different total, and the count drifts as assessments are added. A hardcoded count in the meta description and visible copy is both a trust risk and a stale-data signal. **Recommend deriving the count at build time** from the 7 index JSON files (sum of `rankings.length`) rather than hardcoding — same discipline the spokes use (`data.rankings.length`). Until then, reconcile the number against the actual JSON sums (the 7 files each carry `rankings`/count metadata).

---

## Ranked improvements

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.

### 1. Add the missing 2 city indexes + a daily-briefing link to the hub `[Goals 1, 3]` — HIGHEST
The hub omits `/us-cities` and `/global-cities` (2 real index families) and never links `/updates`. This is a correctness + completeness fix, not a nice-to-have: today the hub misrepresents the benchmark's coverage to humans and engines, and severs Goal 3 entirely. Add the 2 city cards to the "Current indexes" grid and add a prominent "Latest daily briefing" link/section pointing at `/updates`.
*Impact: high · Alignment: high · Confidence: high · Effort: low · Risk: low.* **Frontend handoff.**

### 2. Add `CollectionPage` + `ItemList` JSON-LD enumerating all 7 indexes `[Goal 1]`
The single biggest AEO unlock for the hub: a machine-legible map of the 7 indexes → their dataset URLs, binding hub→spokes→institution. Reuse the spoke pattern. Must list all 7 (depends on #1 fixing the data set of links so schema and visible links match).
*Impact: high · Alignment: high · Learning: high · Confidence: high · Effort: low-med · Risk: low.* **Frontend/SEO handoff.**

### 3. Rewrite the title + description + add an answer-first lead sentence `[Goals 1, 3]`
Title → something like `"The Compassion Benchmark Indexes — 7 Rankings of Institutional Compassion"`. Description → lead with the citable cross-sector fact + real entity count. Add one extractable lead sentence in the hero stating scope + counts. Pure on-page, no new components.
*Impact: high · Alignment: high · Confidence: high · Effort: low · Risk: low.*

### 4. Add `BreadcrumbList` + `FAQPage` JSON-LD (with visible `FaqAccordion`) `[Goals 1, 2]`
Breadcrumb is trivial (`Home › Indexes`) and closes the loop the spokes already point to. The hub FAQ owns the cross-cutting questions ("what is the benchmark," "how many entities," "what sectors," "how is the score calculated" → methodology). Reuse `FaqJsonLd` + `FaqAccordion`. Real Q&A only.
*Impact: med-high · Alignment: high · Confidence: high · Effort: low · Risk: low (only if answers stay factual).*

### 5. Promote methodology to a prominent descriptive link near the top `[Goal 2]`
Methodology is currently only a one-word footer anchor. Add a visible "How the score is calculated" link/CTA in the hero or a short methodology strip. Supports Goal 2 for humans and gives engines a strong internal edge from hub→methodology.
*Impact: med · Alignment: high · Confidence: high · Effort: low · Risk: low.*

### 6. Derive the entity count at build time; add a self-canonical + freshness line `[Goal 1]`
Replace the 3 hardcoded `1,155` instances with a build-time sum across the 7 index JSON files, add `alternates.canonical: "/indexes"`, and surface a "Last updated"/latest-briefing date. Removes a stale-data/trust risk and adds a freshness signal.
*Impact: med · Alignment: high · Confidence: med (verify count source) · Effort: low-med · Risk: low.* **Frontend handoff.**

---

## Top 3 next moves
1. **Fix coverage + Goal 3:** add `/us-cities` + `/global-cities` cards and a `/updates` daily-briefing link to the hub (#1).
2. **Ship hub schema:** `CollectionPage` + `ItemList` over all 7 indexes, plus `BreadcrumbList` (#2, #4).
3. **Rewrite title/description + add the answer-first cross-sector sentence** with a real, build-time entity count (#3, #6).

## What to measure
- **Indexation/coverage:** all 7 spokes reachable from `/indexes` (target: 7/7; today 5/7).
- **Structured-data validity:** `CollectionPage`/`ItemList`/`BreadcrumbList`/`FAQPage` pass Rich Results Test with zero errors.
- **Hub query impressions** (Search Console): "compassion benchmark indexes / rankings / institutional compassion rankings" — baseline now, watch post-title-rewrite.
- **AEO citation check** (manual, WebSearch/Perplexity): does an engine asked *"what does the Compassion Benchmark rank?"* return all 7 sectors and cite `/indexes`? Baseline → re-test after the answer-first sentence + ItemList ship.
- **Entity-count accuracy:** zero hardcoded stale counts (build-time derived).

## Handoffs
- **frontend-engineer:** items #1, #2, #5, #6 (add city cards + briefing link; mount `CollectionPage`/`ItemList`/`Breadcrumb`/`FAQPage` JSON-LD reusing `site/src/components/seo/*`; build-time entity count).
- **knowledge-architect:** confirm the hub FAQ question set and the canonical one-sentence scope statement (comprehension ownership).
- **conversion-strategist:** the closing commercial-link block is theirs; ensure the discovery additions don't get buried under sales CTAs.
- **technical pass (separate):** verify `/indexes` in `sitemap.ts`; confirm whether a public `/data` download surface exists to link.

**Artifact:** `C:\Users\philk\applied-compassion-benchmark\docs\INDEXES_REVIEW_SEO_2026-06-17.md`
