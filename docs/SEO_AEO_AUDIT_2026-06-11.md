# SEO + AEO/GEO Audit — Compassion Benchmark

**Date:** 2026-06-11
**Author:** seo-aeo-architect
**Scope:** All page templates, content, and the content-generation pipeline
**Status:** Review/audit only — no site code, schema, or pipeline modified this pass. Backlog handed to coordinator for sequencing.
**Canonical host:** `https://compassionbenchmark.com` · static export (Next.js 16 `output: 'export'`) · Nginx + Cloudflare Worker for dynamic concerns.

---

## 1. Executive summary

### Current posture — what is already strong

The discoverability foundation here is genuinely good, and unusually so for a pre-scale benchmark. Concretely, grounded in the repo:

- **Static + Nginx + Cloudflare baseline** = strong Core Web Vitals headroom by default; `images: unoptimized` is the only weight risk, partly mitigated because charts are own-data SVG.
- **Canonicalization is consistent.** `metadataBase` is set in `layout.tsx`; entity pages (`renderEntityPage.tsx` → `makeGenerateMetadata`), `updates/[date]`, and `updates/special/[slug]` all emit a self-referential absolute canonical. No www/host drift in the templates I read.
- **Sitemap is comprehensive and build-time-correct.** `sitemap.ts` enumerates all 7 indexes, all entity slugs across 7 kinds, all history pages, all daily-briefing dates, plus service/tool/info pages — driven off the same data the pages render from, so it cannot drift.
- **Per-template metadata is real, not boilerplate.** The entity `generateMetadata` front-loads `<Entity> — Compassion Score <n> (<band>)` and a description carrying rank, index total, and band. The daily-briefing template derives OG title/description from the actual lead finding.
- **Structured data already exists at three layers:** `ResearchOrganization` (root layout), `Dataset` on each index (`DatasetJsonLd`), `Rating` per entity (`renderEntityPage`), `NewsArticle` per daily briefing, `Article` per special briefing. Most competitors (incl. Transparency International's CPI) ship *none* of this on their canonical pages — verified live below.
- **OG images** generated per page (`build-og-images.mjs`), **RSS + JSON feeds** (`build-feeds.mjs`), **Pagefind** client-side search with `data-pagefind-body` scoping, and a **`CrawlableRankingTable`** that emits a server-rendered, link-rich version of each ranking so crawlers and answer engines can read the full index without executing the interactive table.
- **The evidence layer is a native AEO asset.** `EvidenceItem` atoms (verbatim quote + source + required URL + tier) are exactly what answer engines preferentially cite — content that itself cites primary sources.

### What is missing (the gaps this audit closes)

1. **No `sameAs` / Wikidata / Wikipedia disambiguation on any entity** — the single biggest AEO leak. `entities.ts` has no identifier field; root `Organization.sameAs` is `[]`. Engines cannot reliably bind "our Iran score" to the real-world entity, and cannot attribute citations to *us* by name.
2. **No `llms.txt` / no deliberate AI-crawler policy.** `robots.ts` is a bare `allow: /` with no named stance on GPTBot/ClaudeBot/PerplexityBot/Google-Extended. For an institution whose growth engine is *being cited*, this is an un-made strategic decision.
3. **The entity `Rating` JSON-LD is weak and slightly non-standard** — bare `Organization` (never `Country`/`AdministrativeArea`/`Place`), no `sameAs`, no `BreadcrumbList`, no `FAQPage`, and `Rating` used as a top-level node rather than nested in a review of a typed entity.
4. **The 8 dimensions + 5 bands are never taught to engines as a vocabulary** — no `DefinedTermSet`. We publish a framework; we don't let machines reuse our framing.
5. **The pipeline bakes in no SEO/AEO at the source.** The briefing schema (`DAILY_BRIEFING_SCHEMA.md`) has no `seoTitle`, `metaDescription`, `faq[]`, or explicit internal-link-target fields; the render layer reverse-engineers them heuristically (e.g. `updates/[date]` slices the first sentence of `summary`). Quality is left to chance ×30+ briefings.
6. **Dataset schema is incomplete vs Google's spec** — missing `license` (CLAUDE.md asserts CC-BY but schema doesn't state it), `identifier`, and `temporalCoverage` in ISO interval form; `description` should be ≥50 chars (it is, but unenforced).
7. **Index pages have no `FAQPage` / no extractable "most/least compassionate" answer block** — the exact superlative queries answer engines love, left on the table.

### Live-web validation (focused)

- Branded search **"Compassion Benchmark institutional compassion"** already surfaces `compassionbenchmark.com/us-states` as the **#1 result** — indexation is working; the brand is becoming the entity for the query class.
- BUT answer engines do **not** yet surface our **global countries** ranking by name; they fall back to unrelated "most empathetic countries" studies. The countries index is our flagship and is **under-attributed** — an entity-disambiguation + answer-first gap, not a crawl gap.
- **Transparency International's CPI** — our closest comparator — ships **no schema.org Dataset markup** on its canonical pages (verified). Google's own Dataset guidance rewards `creator`/`license`/`distribution`/`variableMeasured`/`temporalCoverage`/`sameAs`. **The Dataset-citation lane is uncontested. This is the moat.**

### The single highest-leverage move

**Make every entity disambiguatable and every index a fully-specified, licensed Dataset — i.e., add `sameAs` (Wikidata/Wikipedia/official URL) to the entity data layer and upgrade the per-entity + per-index JSON-LD to typed, identified, licensed nodes.** This is one surgical change to `entities.ts` + `renderEntityPage.tsx` + `DatasetJsonLd.tsx` that multiplies across **1,160 entity pages + 7 indexes**, directly fixes the countries-attribution gap, and lands us in the citation lane competitors have left empty. It is white-hat by construction: every `sameAs` is a real, verifiable link; every Dataset field traces to real benchmark data.

---

## 2. The SEO/AEO scorecard

Measured on a static + Cloudflare + Umami + privacy-light stack. Every metric has an owner action behind it (per repo measurement principle — if no one will act, we don't track it).

| Metric | How measured (this stack) | Baseline (2026-06-11) | Target (90 days) | How we'll know |
|---|---|---|---|---|
| **Indexation coverage %** | Google Search Console (GSC) Pages report + Bing Webmaster; sitemap submitted | Sitemap complete; coverage unverified (GSC not confirmed wired) | ≥95% of sitemap URLs indexed | GSC "Indexed" ÷ submitted |
| **Branded impressions** (`compassion benchmark`, `<entity> compassion score`) | GSC Performance, query filter | #1 for core brand (live-verified) | +50% impressions, ≥20 entity queries with impressions | GSC query class trend |
| **Non-branded / superlative impressions** (`most compassionate countries 2026`, `least compassionate companies`) | GSC Performance, regex query filter | Near-zero (no answer block exists) | First page for ≥5 superlative queries | GSC + manual SERP check |
| **Structured-data validity** | Google Rich Results Test + Schema Markup Validator on a sampled page per template (8 templates) | Valid but incomplete (no license/identifier/sameAs) | Zero errors, zero warnings on all 8 templates | Validator run in CI/manual |
| **Answer-engine citation count** (sampled) | Manual monthly probe: ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews on 10 fixed prompts (e.g. "what is <Entity>'s compassion score") | 0 confirmed citations | ≥3 engines cite us by name+URL on ≥3 prompts | Logged in `research/aeo-citation-log/` (new) |
| **Internal orphan count** | Build-time crawl of `out/` link graph vs sitemap | Unknown (no check exists) | 0 orphans (every sitemap URL reachable in ≤3 hops from `/`) | New `check-internal-links.mjs` (proposed) |
| **CWV pass rate** | GSC Core Web Vitals + PageSpeed Insights on 1 sample per template | Likely passing (static); LCP/image weight unverified | 100% "Good" on mobile | GSC CWV report |
| **Dataset Search presence** | `datasetsearch.research.google.com` query for index names | Absent | All 7 indexes discoverable | Manual quarterly |

**Instrumentation gaps to close first:** confirm GSC + Bing Webmaster property verification (static host — verify via DNS TXT or the existing `/public` file drop), and stand up the manual AEO citation log. Umami already gives us on-site engagement but **cannot** measure off-site citation — that is inherently a manual probe.

---

## 3. Six-layer findings

Each finding: **gap → evidence (file/URL) → impact → fix → ×leverage.**

### Layer 1 — Technical SEO / crawlability

**1.1 — No AI-crawler policy (AEO-critical).**
*Evidence:* `site/src/app/robots.ts` is a single `userAgent: "*", allow: "/"`. No named rule for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bytespider.
*Impact:* For a benchmark whose growth = citation, the strategic default should be an **explicit, reasoned ALLOW** of citation-driving bots (visibility > hoarding) — but right now it's an accident, not a decision, and we can't tune it per-bot later without first making it explicit.
*Fix:* Add named `rules[]` entries (explicit allow for citation crawlers; optionally disallow purely-extractive scrapers that don't drive citations). Static-export-safe — `robots.ts` is build-time.
*Leverage:* Site-wide, one file.

**1.2 — Service/tool pages are in the sitemap but are conversion pages, not indexable authority.**
*Evidence:* `sitemap.ts` includes `/purchase-research`, `/data-licenses`, `/advisory`, `/certified-assessments`, `/enterprise`, `/contact-sales`, plus tool pages. Some are thin/commercial.
*Impact:* Minor crawl-budget dilution and thin-content risk if any are near-empty. Not urgent at this scale, but they shouldn't outrank authority pages.
*Fix:* Keep indexed only those with genuine unique content; set lower priority (already 0.5–0.7); audit each for ≥1 substantive H1 + 150+ words. No removal needed yet.
*Leverage:* ~13 pages.

**1.3 — No `lastModified` freshness signal tied to actual data changes.**
*Evidence:* `sitemap.ts` sets `lastModified: now` for all entity pages on every build (correct-ish), but daily briefings correctly use the date and `changeFrequency: "never"`. Entity pages claim weekly change even when unchanged.
*Impact:* Minor — engines discount over-claimed freshness. Real opportunity is the inverse: when an entity score *actually* moves (history exists), surface a true `dateModified`.
*Fix:* Drive entity `lastModified` from the entity's latest history event date when present; fall back to build time. Needs history-manifest read in `sitemap.ts` (data already imported).
*Leverage:* ×1,160 (those with history).

**1.4 — No internal-orphan / link-graph check in the build.**
*Evidence:* No `check-internal-links.mjs` in `site/scripts/`. The internal graph is the path crawlers use to find the long-tail.
*Impact:* Unknown orphan risk at 1,160 pages. Index→entity links exist (RankingTable + CrawlableRankingTable); entity→related-entity and briefing→entity links are weaker (see 2.4).
*Fix:* Add a build-time link-graph audit (hand to frontend/backend-engineer).
*Leverage:* Whole-site integrity gate.

### Layer 2 — On-page SEO (remember ×1,160)

**2.1 — Entity titles are strong; descriptions are good but could lead with the extractable sentence.** *(Low priority — already solid.)*
*Evidence:* `makeGenerateMetadata` → `"<name> — Compassion Score <n> (<band>)"`. This is excellent answer-first metadata.
*Impact:* Positive. Keep.

**2.2 — Index page titles miss the superlative query.**
*Evidence:* `countries/page.tsx` `metadata.title = "World Countries Index 2026"`. Users and engines search **"most compassionate countries 2026."**
*Impact:* We don't title-match the highest-intent superlative query class.
*Fix:* Title/description should include a superlative framing and the year, e.g. `"Most & Least Compassionate Countries 2026 — Compassion Benchmark Index"`, plus a short extractable answer block naming the #1 and last-ranked entity (real data only).
*Leverage:* ×7 indexes — but these are the highest-traffic hubs.

**2.3 — No on-page extractable "answer block" on index pages.**
*Evidence:* `countries/page.tsx` leads with `IndexHero` (stats) then the table. There's no single copy-paste sentence: *"As of 2026, <Country A> is the most compassionate country (<score>/100, Exemplary) and <Country Z> the least (<score>/100, Critical) on the Compassion Benchmark."*
*Impact:* LLMs lift the first clean factual sentence; we don't give them one for the superlative query.
*Fix:* Add a build-time answer-first `<p>` (own data) above the table on each index. Pairs with FAQPage (3.5).
*Leverage:* ×7, highest-intent.

**2.4 — Briefing→entity and entity→related-entity internal links are thin.**
*Evidence:* `updates/special/[slug]/page.tsx` links body sections + companion links, but body is `dangerouslySetInnerHTML` from `section.html` — internal links exist only if the *pipeline* emitted them. The schema has no required internal-link-target field (see Layer 5). Entity pages link up to the index but not laterally to sector peers.
*Impact:* Weakens the hub-and-spoke graph that both ranks pages and lets crawlers discover the long-tail.
*Fix:* (a) pipeline emits explicit entity links (Layer 5); (b) entity template adds a "Compared to sector peers" link cluster (3–5 nearest-rank same-sector entities). Hand to frontend-engineer.
*Leverage:* ×1,160 + ×all briefings.

**2.5 — SVG chart alt/accessible-name coverage unverified.**
*Evidence:* Charts are own-data SVG (`CompositeSparkline`, `BandDistributionBar`). Need `role="img"` + `aria-label`/`<title>` carrying the data ("Composite score 18.4 of 100, Critical band").
*Impact:* Image SEO + accessibility + a second extractable text surface for the score.
*Fix:* Audit chart components for accessible names. Hand to frontend-engineer/ux-designer.
*Leverage:* Per chart component (reused ×1,160).

### Layer 3 — Structured data / JSON-LD (the SEO↔AEO bridge — highest leverage)

**3.1 — Entity JSON-LD uses bare `Organization` for every kind and has no `sameAs`. (TOP FINDING.)**
*Evidence:* `renderEntityPage.tsx` lines 113–133: `itemReviewed: { "@type": "Organization", name }` for *all* kinds — countries, states, cities included. No `sameAs`, no `url`, no `identifier`.
*Impact:* (a) Countries/cities/states are not `Organization`s — wrong type confuses the knowledge graph; (b) with no `sameAs`, engines can't bind our score to the real-world entity (the "UAE vs United Arab Emirates" failure class, and the live countries-attribution gap). This is the #1 AEO leak.
*Fix:* Per-kind `itemReviewed` type (`Country` / `AdministrativeArea` / `City` / `Organization`), add `url` (official site), and `sameAs: [wikipedia, wikidata]` sourced from a new field on the entity record. Restructure as `Review`/`ItemReviewed` with the `Rating` nested. **Never invent a `sameAs` — only real, verified links.**
*Leverage:* ×1,160.

**3.2 — Dataset schema incomplete vs Google's Dataset spec.**
*Evidence:* `DatasetJsonLd.tsx` has `name/description/variableMeasured/creator/distribution/temporalCoverage` but **no `license`** (CLAUDE.md asserts CC-BY!), **no `identifier`**, `temporalCoverage: "2026"` not ISO interval, `distribution.encodingFormat: "text/html"` (should also offer a real data download).
*Impact:* We forfeit Dataset Search eligibility polish and the `license` field that makes us the *citable, reusable* source — exactly the lane CPI leaves empty.
*Fix:* Add `license` (CC-BY URL), `identifier`, ISO `temporalCoverage: "2026-01-01/2026-12-31"`, `spatialCoverage` typed, and a real `DataDownload` (CSV/JSON) where one exists. Surgical, ×7.
*Leverage:* ×7 indexes — the moat.

**3.3 — No `BreadcrumbList` anywhere.**
*Evidence:* Visual breadcrumbs exist (`EntityDetail` hero, special-briefing nav) but no `BreadcrumbList` JSON-LD.
*Impact:* Loses breadcrumb rich result + hierarchy legibility for engines.
*Fix:* Emit `BreadcrumbList` in `renderEntityPage`, index pages, and briefing templates. Surgical.
*Leverage:* Sitewide.

**3.4 — No `DefinedTermSet` for the 8 dimensions + 5 bands.**
*Evidence:* `dimensions.ts` defines the full vocabulary (8 dims × 5 subdims + band descriptions in `BAND_DESCS`) but it's never expressed as schema.
*Impact:* We don't teach engines our taxonomy, so they paraphrase our framework instead of reusing it. Defining it makes "AWR / Awareness / Suffering Detection" *our* citable vocabulary.
*Fix:* Emit one `DefinedTermSet` (dimensions) + one (bands) on `/methodology`, referenced by entity pages via `additionalType`/`about`. Surgical, build-time from `dimensions.ts`.
*Leverage:* Methodology hub + referenced ×1,160.

**3.5 — No `FAQPage` on entity or index pages (only real Q&A).**
*Evidence:* None present. The data answers real questions: "What is <Entity>'s compassion score?" / "How is it calculated?" / "Where does <Entity> rank?"
*Impact:* Forfeits FAQ rich results AND gives answer engines pre-formatted Q→A pairs (high citation value).
*Fix:* Build-time `FAQPage` from real entity data + methodology. **Only genuinely-answered questions; never fabricated.** ×1,160 + ×7.
*Leverage:* ×1,160 + ×7.

**3.6 — Root `Organization.sameAs` is empty.**
*Evidence:* `layout.tsx` line 50: `sameAs: []`.
*Impact:* The institution itself has no entity-graph anchor, so citations aren't attributed to a known entity.
*Fix:* Populate with real profiles only (Gumroad store, LinkedIn, X, Wikidata if/when one exists). Add `logo`, `knowsAbout` (institutional compassion, benchmarking), `foundingDate` already present. Surgical.
*Leverage:* Sitewide identity.

### Layer 4 — AEO / GEO (answer-engine optimization)

**4.1 — No `llms.txt`.** *(See top-5 spec.)*
*Evidence:* No `site/public/llms.txt` / `ai.txt`.
*Impact:* Emerging AEO standard; maps our authoritative resources (indexes, methodology, latest briefings, dataset downloads, feeds) for LLM crawlers. Static-export-safe (drop a file in `/public`).
*Fix:* Author `llms.txt`. ×whole-site.

**4.2 — Entity pages lack a single self-contained extractable lead sentence in the *content*.**
*Evidence:* `EntityDetail` hero shows name, `<Band>`, "Rank #X of Y" as separate elements — visually clear, but not one copy-paste sentence with date + units. The metadata has it; the *body* (what gets scraped) doesn't lead with it.
*Impact:* Answer engines lift the first clean factual sentence from the body. We should hand them: *"As of <last-assessed date>, <Full Entity Name> scores <n>/100 (<Band>) on the Compassion Benchmark, ranking #<r> of <total> among <index>."*
*Fix:* Add a build-time answer-first `<p>` at the top of `EntityDetail` (own data, dated). White-hat — it's just our data stated plainly.
*Leverage:* ×1,160.

**4.3 — Freshness signal ("Last assessed <date>") is inconsistent.**
*Evidence:* Entity pages show a freshness stamp via history; entities with no history show none, and there's no `dateModified` in the entity JSON-LD.
*Impact:* Answer engines favor demonstrably current data; we under-signal it.
*Fix:* Always render "Last assessed / reviewed <date>" + add `dateModified` to entity JSON-LD (from latest history/evidence-review date, else publication date).
*Leverage:* ×1,160.

**4.4 — Superlative content has no extractable summary.** (Same root as 2.3/3.5.) Answer engines love "most/least X" lists; our indexes natively answer them but don't *say so* in one liftable sentence + FAQ.

**4.5 — Full-entity-name consistency / disambiguation.** (Same root as 3.1.) Pipeline and data must use canonical full names + `sameAs` so engines bind the score to the right entity. The live countries-attribution gap is this finding made visible.

### Layer 5 — Content-generation pipeline (fix discoverability at the source)

**5.1 — Briefing schema has no SEO/AEO fields; render layer guesses them.**
*Evidence:* `DAILY_BRIEFING_SCHEMA.md` defines `title`, `headline`, `summary`, structured arrays — but **no `seoTitle`, no `metaDescription`, no `faq[]`, no `dateModified`, no explicit internal-link targets.** `updates/[date]/page.tsx` reverse-engineers OG description by slicing `summary.split(/(?<=[.!?])\s+/)[0]` — fragile heuristic ×every briefing.
*Impact:* SEO/AEO quality of 30+ (and growing daily) briefings is left to chance instead of authored at the source where it compounds.
*Fix:* Extend the schema + `overnight-digest` / `special-briefing` prompts to emit: `seoTitle`, `metaDescription` (answer-first, ≤155 chars), an `answerFirst` lead sentence, a `faq[]` of real Q&A, `linkedEntities[]` (slugs the briefing discusses → internal links), and rely on existing `generatedAt` for `dateModified`. Validate in `validate-daily-briefings.mjs`. Hand to pipeline-agent + backend-engineer.
*Leverage:* ×all future briefings (compounding daily).

**5.2 — Entity-name canonicalization not enforced across the pipeline.**
*Evidence:* Slugs are canonical (`entities.ts`), but display names and the future `sameAs` field aren't pipeline-validated against a registry.
*Impact:* Feeds the disambiguation problem (3.1/4.5).
*Fix:* A canonical entity registry (name + `sameAs`) the pipeline and site both read. Hand to data-engineer/backend-engineer.

**5.3 — Hub-and-spoke linking is implicit, not specified.**
*Evidence:* Briefings = freshness layer, entity/index = evergreen hubs, but the pipeline doesn't *require* briefings to link back into the hubs (5.1's `linkedEntities[]` fixes this).
*Impact:* The compounding internal-link graph isn't guaranteed.
*Fix:* Make `linkedEntities[]` required + render as in-body links. (Bundled with 5.1.)

**5.4 — Topical-authority content gaps (real-data only, no doorway pages).**
*Evidence:* No per-dimension explainer pages ("What is the Awareness dimension?"), no "What is institutional compassion?" explainer, no per-category superlative landing ("Most compassionate AI labs 2026"). `dimensions.ts` already holds the substance for the dimension explainers.
*Impact:* High-intent informational queries have no landing page; these are legitimate, substance-backed pages — NOT doorway pages.
*Fix:* Propose `/methodology/dimensions/<code>` (8 pages from real `dimensions.ts` data) + a "what is institutional compassion" hub. Hand to knowledge-architect (comprehension) + frontend-engineer (build); SEO owns the schema/linking spec.

### Layer 6 — Measurement

**6.1 — GSC/Bing verification unconfirmed.** Static host — verify via DNS TXT or `/public` token file. Without it, indexation %, impressions, and CWV are unmeasurable. **First measurement action.**

**6.2 — No AEO citation log.** Off-site citation can't be auto-measured on this stack. Stand up `research/aeo-citation-log/<date>.md` with 10 fixed probe prompts across 5 engines, run monthly. (Mirrors the existing `research/integrity-reports/` cadence.)

**6.3 — No structured-data validity gate.** Add Rich Results Test runs (manual or CI) on one sample per template after each schema change; target zero errors.

---

## 4. Ranked backlog

**Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (each 1–5; Priority shown as net).
**Type:** `[SURGICAL]` = static-export-safe metadata/JSON-LD/robots/sitemap edit SEO can own · `[FE]` frontend-engineer · `[BE]` backend-engineer · `[PIPE]` pipeline-agent · `[CONTENT]` knowledge-architect.

### Wave 1 — Surgical, highest-leverage, lowest-risk (do first)

| # | Item | Finding | Type | Impact | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|---|
| 1 | **`sameAs` on entity data + typed per-entity JSON-LD** (Country/Place/Org + sameAs + dateModified) | 3.1, 4.5, 3.6 | [SURGICAL]+[BE] (data field) | 5 | 3 | 2 | **+14** |
| 2 | **Complete Dataset schema** (license CC-BY, identifier, ISO temporalCoverage, DataDownload) | 3.2 | [SURGICAL] | 5 | 1 | 1 | **+16** |
| 3 | **`llms.txt`** mapping authoritative resources | 4.1 | [SURGICAL] | 4 | 1 | 1 | **+13** |
| 4 | **AI-crawler policy in `robots.ts`** (explicit reasoned allow) | 1.1 | [SURGICAL] | 4 | 1 | 1 | **+13** |
| 5 | **Answer-first lead `<p>` on entity + index pages** (own data, dated) | 4.2, 2.3 | [FE] (template) | 5 | 2 | 1 | **+14** |
| 6 | **`DefinedTermSet`** (8 dimensions + 5 bands) on `/methodology` | 3.4 | [SURGICAL] | 4 | 2 | 1 | **+12** |
| 7 | **`BreadcrumbList`** sitewide | 3.3 | [SURGICAL] | 3 | 2 | 1 | **+9** |
| 8 | **Root `Organization.sameAs` + logo + knowsAbout** | 3.6 | [SURGICAL] | 3 | 1 | 1 | **+10** |

### Wave 2 — Templates + FAQ + superlative hubs

| # | Item | Finding | Type | **Priority** |
|---|---|---|---|---|
| 9 | **`FAQPage`** on entity + index pages (real Q&A only) | 3.5 | [FE]+[SURGICAL schema] | **+11** |
| 10 | **Superlative index titles + answer block** (most/least compassionate `<category>` 2026) | 2.2, 4.4 | [FE] | **+11** |
| 11 | **Entity → sector-peer internal link cluster** | 2.4 | [FE] | **+9** |
| 12 | **Per-dimension explainer pages** (`/methodology/dimensions/<code>`) | 5.4 | [CONTENT]+[FE] | **+8** |
| 13 | **SVG chart accessible names** carrying the score | 2.5 | [FE] | **+7** |
| 14 | **Sitemap `lastModified` from real history dates** | 1.3 | [BE] | **+7** |

### Wave 3 — Pipeline (compounding) + measurement

| # | Item | Finding | Type | **Priority** |
|---|---|---|---|---|
| 15 | **Briefing schema SEO/AEO fields** (`seoTitle`, `metaDescription`, `answerFirst`, `faq[]`, `linkedEntities[]`) + validator | 5.1, 5.3 | [PIPE]+[BE] | **+12** |
| 16 | **Canonical entity registry** (name + sameAs) shared by pipeline + site | 5.2 | [BE] | **+9** |
| 17 | **GSC + Bing verification** | 6.1 | [SURGICAL] (token file) | **+10** |
| 18 | **AEO citation log** (`research/aeo-citation-log/`, monthly) | 6.2 | [SURGICAL] (process) | **+8** |
| 19 | **Internal-link / orphan build check** | 1.4 | [BE] | **+7** |
| 20 | **Structured-data validity gate** (Rich Results Test sampling) | 6.3 | process | **+6** |

---

## 5. Implementable spec — top 5 items

> All shapes are illustrative; every value must trace to real benchmark data or a real verified link. No fabricated `sameAs`, FAQ, rating, or quote.

### Top 1 — Typed per-entity JSON-LD with `sameAs` (`renderEntityPage.tsx` + `entities.ts`)

**Data change (`entities.ts`):** add to the `Entity` interface (and source JSON / a sidecar registry):
```ts
identifiers?: {
  wikidata?: string;     // e.g. "https://www.wikidata.org/wiki/Q794"
  wikipedia?: string;    // e.g. "https://en.wikipedia.org/wiki/Iran"
  officialSite?: string; // entity's own homepage
};
```
Populate ONLY where a verified match exists; omit otherwise (never guess).

**JSON-LD (replace the bare `Rating` block):**
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Country",                         // per-kind: Country | AdministrativeArea | City | Organization
    "name": "Iran",
    "url": "https://www.president.ir/",          // officialSite when known
    "sameAs": [
      "https://en.wikipedia.org/wiki/Iran",
      "https://www.wikidata.org/wiki/Q794"
    ]
  },
  "author":    { "@type": "Organization", "name": "Compassion Benchmark", "url": "https://compassionbenchmark.com" },
  "publisher": { "@type": "Organization", "name": "Compassion Benchmark", "url": "https://compassionbenchmark.com" },
  "datePublished": "2026-01-01",
  "dateModified": "2026-06-06",                  // latest history/evidence-review date, else publication
  "reviewAspect": "Institutional compassion",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 18.4,
    "bestRating": 100,
    "worstRating": 0,
    "ratingExplanation": "Composite compassion score 18.4/100 (Critical), rank 171 of 193 in the World Countries Index."
  },
  "isBasedOn": "https://compassionbenchmark.com/methodology"
}
```
Per-kind type map (`KIND_CONFIG`): `country→Country`, `us-state→AdministrativeArea`, `city`/`us-city→City`, `company→Organization`, `ai-lab`/`robotics-lab→Organization`.
**Acceptance:** Rich Results Test = 0 errors on one page per kind; `sameAs` present wherever an identifier exists; no fabricated links.

### Top 2 — Complete Dataset schema (`DatasetJsonLd.tsx`)

Add to the existing object:
```json
{
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "identifier": "https://compassionbenchmark.com/countries#dataset-2026",
  "temporalCoverage": "2026-01-01/2026-12-31",
  "isAccessibleForFree": true,
  "creator": { "@type": "Organization", "name": "Compassion Benchmark",
               "url": "https://compassionbenchmark.com",
               "sameAs": ["<verified profile URLs only>"] },
  "distribution": [
    { "@type": "DataDownload", "encodingFormat": "text/html",
      "contentUrl": "https://compassionbenchmark.com/countries" },
    { "@type": "DataDownload", "encodingFormat": "application/json",
      "contentUrl": "https://compassionbenchmark.com/data/scores/<index>.json" }
  ]
}
```
> Confirm CC-BY is the intended public license before asserting it (CLAUDE.md references CC-BY; independence policy must not be contradicted by a license that implies paid inclusion). The `application/json` distribution should point at a real generated file (`export-public-data.mjs` already emits per-entity score JSON — add/confirm a per-index aggregate).
**Acceptance:** Google Dataset Search lists all 7 indexes within 30 days; validator clean.

### Top 3 — `site/public/llms.txt`

```
# Compassion Benchmark — llms.txt
# Independent benchmark institution measuring how institutions recognize,
# respond to, and reduce suffering. Free to cite with attribution.

> Compassion Benchmark publishes comparative compassion rankings across
> 1,160+ entities in 7 indexes (countries, US states, Fortune 500 companies,
> AI labs, robotics labs, US cities, global cities), scored on 8 dimensions
> of institutional compassion. Methodology and primary-source evidence are public.

## Core indexes (datasets)
- World Countries Index 2026: https://compassionbenchmark.com/countries
- US States Index 2026: https://compassionbenchmark.com/us-states
- Fortune 500 Index 2026: https://compassionbenchmark.com/fortune-500
- AI Labs Index 2026: https://compassionbenchmark.com/ai-labs
- Robotics Labs Index 2026: https://compassionbenchmark.com/robotics-labs
- US Cities Index 2026: https://compassionbenchmark.com/us-cities
- Global Cities Index 2026: https://compassionbenchmark.com/global-cities

## Methodology & framework
- Methodology (8 dimensions, 40 subdimensions, 5 bands): https://compassionbenchmark.com/methodology

## Freshness
- Daily research briefings: https://compassionbenchmark.com/updates
- RSS feed: https://compassionbenchmark.com/updates/feed.xml
- JSON feed: https://compassionbenchmark.com/updates/feed.json

## Attribution
Cite as: "Compassion Benchmark (compassionbenchmark.com)". Scores are dated;
always include the assessment date and that scores are out of 100.
```
Generate at build time from the index list so it can't drift. **Acceptance:** file served at `/llms.txt`; all URLs 200.

### Top 4 — AI-crawler policy (`robots.ts`)

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Explicit, reasoned ALLOW — citation visibility is the growth engine.
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User",
                    "ClaudeBot", "Claude-Web", "anthropic-ai",
                    "PerplexityBot", "Perplexity-User",
                    "Google-Extended", "Applebot-Extended", "CCBot"],
        allow: "/" },
    ],
    sitemap: "https://compassionbenchmark.com/sitemap.xml",
    host: "https://compassionbenchmark.com",
  };
}
```
Decision recorded: ALLOW all citation-driving crawlers; revisit only if a bot extracts without driving attribution. **Acceptance:** `/robots.txt` lists the named agents; no accidental disallow.

### Top 5 — Answer-first lead sentence (entity + index templates)

**Entity (`EntityDetail` hero, build-time, own data):**
```tsx
<p data-pagefind-meta="answer">
  As of {lastAssessedDate}, {entity.name} scores {entity.composite.toFixed(1)}/100
  ({entity.band}) on the Compassion Benchmark, ranking #{entity.rank} of
  {entity.indexTotal} in the {config.indexLabel}.
</p>
```
**Index (above the table, own data):**
```tsx
<p>
  As of 2026, {topEntity.name} is the most compassionate {noun}
  ({topEntity.composite}/100, {topEntity.band}) and {bottomEntity.name} the least
  ({bottomEntity.composite}/100, {bottomEntity.band}) on the Compassion Benchmark
  {indexLabel}, which scores {count} {pluralNoun} across 8 dimensions.
</p>
```
Both are pure restatements of existing data — no new claims, fully white-hat. **Acceptance:** the sentence is the first text node inside `data-pagefind-body`; dates + units explicit; manual AEO probe shows engines lifting it within 60 days.

**Companion pipeline edit (Wave 3, Top item #15) — briefing schema additions:**
```jsonc
{
  "seoTitle": "string (≤60 chars, front-loaded entity/topic + Compassion Benchmark)",
  "metaDescription": "string (≤155 chars, answer-first)",
  "answerFirst": "string (one self-contained, dated, sourced lead sentence)",
  "linkedEntities": ["iran", "meta-platforms"],   // slugs → required in-body internal links
  "faq": [ { "question": "string", "answer": "string (real, sourced)" } ]
}
```
Enforce in `validate-daily-briefings.mjs` for dates ≥ a new cutoff; `overnight-digest` / `special-briefing` prompts updated to author these. **Anti-fabrication:** `faq[]` answers must be derivable from the briefing's own evidence; reuse the existing `EvidenceItem` URL-required guard.

---

## 6. Independence check

Every recommendation verified white-hat against the absolute independence constraint:

- **No fabricated structured data.** `sameAs`, FAQ, Dataset fields, ratings, and quotes are all populated *only* from real benchmark data or verified external links. Where an identifier doesn't exist, the field is omitted — never guessed. (Tops 1, 2, 5; Items 9, 15.)
- **No doorway/thin pages.** The only new pages proposed (per-dimension explainers, Item 12) are backed by the real, substantial `dimensions.ts` content (5 anchored subdimensions each) — legitimate informational pages, not keyword doorways. Superlative *framing* (Item 10) restates existing rankings; it adds no new claim.
- **No keyword stuffing / cloaking / link schemes.** Answer-first sentences (Top 5) are plain restatements of on-page data, identical for humans and machines. AI-crawler policy (Top 4) is *allow*, the opposite of cloaking.
- **No fabricated FAQ/quotes.** FAQ answers (Item 9, 15) must derive from real data/evidence; the pipeline's existing `EvidenceItem` `url`-required guard is reused so quotes stay verbatim + sourced.
- **E-E-A-T earned, not faked.** Every leverage point — `dateModified`/last-assessed (4.3), `DefinedTermSet` (3.4), Dataset `license`/`creator` (3.2), the evidence layer's sourced quotes — is *transparency made machine-readable*. Verifiability is the authority, and it's exactly what answer engines reward. No tactic here manufactures authority; they all *surface* real methodology and evidence.
- **License caveat flagged:** before asserting CC-BY in Dataset schema, confirm it doesn't conflict with the commercial-report model (CC-BY on the *rankings data*, not the paid PDF reports — keep the boundary explicit). This is the one item needing a founder/PM decision, noted in handoffs.

No recommendation requires inventing a number, date, quote, rating, or link, or implying a Google rich result that doesn't exist.

---

## 7. Top 3 next moves · what to measure · handoffs

### Top 3 next moves
1. **Ship Wave 1 surgical pack (Items 1–4):** typed entity JSON-LD + `sameAs` (×1,160), complete Dataset schema (×7), `llms.txt`, and the explicit AI-crawler policy. Highest leverage, lowest risk, mostly SEO-ownable metadata edits.
2. **Add the answer-first lead sentence (Item 5)** to the entity + index templates — the move that directly closes the live countries-attribution gap and feeds LLM extraction.
3. **Stand up measurement (Items 17–18):** confirm GSC + Bing verification and open the monthly AEO citation log — otherwise we can't prove any of the above worked.

### What to measure (baseline → target)
- Indexation coverage → ≥95%; structured-data validity → 0 errors on all 8 templates; Dataset Search presence → all 7 indexes; superlative impressions → first page for ≥5 queries; AEO citations → ≥3 engines cite us by name+URL on ≥3 probe prompts within 90 days. (Full table in §2.)

### Explicit handoffs
- **frontend-engineer:** Items 5, 9, 10, 11, 13 (template edits: answer-first blocks, FAQPage render, superlative titles, sector-peer links, chart accessible names) and the build wiring for the data-driven entity JSON-LD.
- **backend-engineer / data-engineer:** Items 1 (entity `identifiers` field + source population), 14 (sitemap `lastModified` from history), 16 (canonical entity registry), 19 (internal-link check), and the per-index JSON `DataDownload` (Top 2).
- **pipeline-agent (overnight-digest + special-briefing) + schema owner:** Item 15 (briefing schema SEO/AEO fields + `validate-daily-briefings.mjs` rules).
- **knowledge-architect:** Item 12 (per-dimension explainer content), in concert with SEO for schema/linking.
- **PM / founder decision needed:** confirm the CC-BY license boundary (data vs paid reports) before Top 2 asserts `license` — the one independence-sensitive call.
- **SEO-architect (self, when scoped):** the surgical metadata/JSON-LD/robots/sitemap/`llms.txt` edits in Items 2, 3, 4, 6, 7, 8, 17, 18.

**Artifact:** `docs/SEO_AEO_AUDIT_2026-06-11.md` (this file).
