# Organic Growth + AEO/GEO — New Page Architecture & Citation Plan (Nonprofit)

**Date:** 2026-07-14
**Author:** seo-aeo-architect
**Scope:** Recommendations only — no code, schema, sitemap, or pipeline changed this pass.
**Model:** Nonprofit. "Growth" = organic search sessions + answer-engine citations (ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude) + email/donation conversion. **NOT sales.**
**Builds on (does not repeat):** `SEO_AEO_AUDIT_2026-06-11.md`, `SEO_AEO_TOP10_STRATEGY_2026-06-11.md`, `GROWTH_SEO_2026-06-15.md`, `GROWTH_MASTER_2026-06-15.md`, `NONPROFIT_ALT_PAGES_BRIEF_2026-07-12.md`, `NONPROFIT_SIMPLIFY_MASTER_2026-07-12.md`.
**Canonical host:** `https://compassionbenchmark.com` · static export (Next.js 16 `output:'export'`) · Nginx + Cloudflare Worker for dynamic concerns.

---

## 0. What changed since the June docs (why this is a new plan, not a re-audit)

1. **Model flip: sales → nonprofit.** The commercial plane is being deleted (`NONPROFIT_SIMPLIFY_MASTER` Phase 2). SEO consequence: (a) the sitemap still lists ~10 commercial routes that are about to 404; (b) the conversion target changes from "buy" to "subscribe / donate / cite"; (c) the independence optics bar is *higher* — a benchmark that files a 990 must be visibly un-buyable, so every SEO tactic must read as public-interest, never pay-for-visibility.
2. **8 indexes now, ~1,256 entity pages** (Universities shipped 2026-06-19; `indexRegistry.ts` is now the single canonical source — S1 done).
3. **Much of Wave-1 shipped:** Dataset JSON-LD, `llms.txt`, AI-crawler allow, breadcrumbs, DefinedTermSet, answer-first sentences, OG cards, RSS/JSON feeds, GSC/Bing verification wiring (`layout.tsx` lines 49-54), 193 country `sameAs`.
4. **Still open and now higher-value:** `FAQPage` (never shipped), `sameAs` for the 967 non-country entities, superlative index titles, entity→peer internal links, per-dimension pages.
5. **New live-web confirmation (2026-07-14):** the superlative SERP for "most compassionate companies/countries 2026" is owned entirely by *adjacent* constructs — Newsweek Most Charitable, Ethisphere World's Most Ethical, Great Place to Work, and a **2016** WEF "empathy index." **Nobody measures or ranks "institutional compassion."** The construct — and its superlative long-tail — is uncontested. This is the whole thesis for the new page architecture below.

---

## 1. The demand map — which net-new page TYPES capture it

Four demand classes, and the page type that captures each. Yields are counted from the real data (`indexRegistry.ts` metadataFields + the index JSON).

| Demand class | Example queries | Page type that captures it | Net-new? |
|---|---|---|---|
| **Faceted superlative** | "most compassionate tech companies", "most compassionate European countries", "least compassionate energy companies 2026" | **Sector/region superlative sub-hubs** (R1) | ✅ NEW — highest yield |
| **Head-to-head** | "openai vs anthropic ethics", "meta vs google", "usa vs china compassion" | **Comparison pages** (R5, bounded/curated) | ✅ NEW — highest ceiling |
| **Informational / definitional** | "what is institutional compassion", "what is the awareness dimension", "how is compassion measured" | **Per-dimension explainer + ranking pages + a definitional hub** (R4) | ✅ NEW |
| **Entity** ("how compassionate is X?") | "meta compassion score", "is amazon compassionate" | **Existing 1,256 entity pages** — do NOT build new; optimize with FAQ + `sameAs` + answer-first (R2, R3, R8) | ⛔ already exists |

**Ruling on the "how compassionate is [entity]?" answer-page idea:** do **not** create a parallel page type — the entity page already *is* that answer. Building a second URL for the same entity would be a duplicate-content collision and, at 1,256×, a thin-content risk. Instead, make the *existing* entity page answer that exact phrasing via FAQ + answer-first lead (R2/R8). Same ruling on "glossary term pages" for the 40 subdimensions: 40 near-identical thin pages would trip a scaled-thin-content penalty — keep subdimensions *inside* the 8 dimension pages (R4), not as their own URLs.

---

## 2. Prioritized recommendations (Priority = Impact + Confidence − Effort)

All scores 1–5. Type: `page-architecture` / `AEO` / `technical` / `content`. Ordered by Priority, then Impact.

| ID | Recommendation | Type | Organic/AEO opportunity (query or answer captured) | Impact | Effort | Conf | **Priority** |
|---|---|---|---|---|---|---|---|
| **R1** | **Sector/region superlative sub-hubs** — faceted "Most & Least Compassionate [Sector/Region] [Category] 2026" pages from existing metadata facets | page-architecture | The entire *faceted* superlative long-tail ("most compassionate tech companies", "most compassionate European countries") — uncontested per live check | 5 | 3 | 4 | **6** |
| **R2** | **`FAQPage` on entity + index + hub pages** (real Q&A from on-page data only) | AEO | Wins AI-Overview / Perplexity / "People also ask" Q-blocks + the click-through for entity + superlative queries | 5 | 2 | 5 | **8** |
| **R3** | **Seed `sameAs` for the 967 non-country entities** (companies + AI/robotics labs first) | AEO | Lets answer engines *bind + cite* "Meta's compassion score" to the real entity — the #1 AEO leak, now ×967 | 5 | 3 | 5 | **7** |
| **R6** | **Sitemap remediation for the nonprofit** — prune the ~10 dying commercial routes, ADD the missing special briefings + `/data` + `/media` + `/updates/forward-watch`; ship Nginx 301s for deleted routes | technical | Stops imminent 404s in the sitemap; makes special reports (currently orphaned from sitemap) crawlable + citable | 4 | 1 | 5 | **8** |
| **R7** | **Superlative index titles + H1 ×8** — `<title>` "Most & Least Compassionate [Category] 2026 — Compassion Benchmark" | AEO | Title-matches the highest-impression head terms on all 8 index hubs (only countries has the answer block today) | 4 | 1 | 5 | **8** |
| **R8** | **Answer-first lead + real freshness** — one dated extractable sentence in the entity *body* + "Last assessed [date]" + `dateModified` in JSON-LD | AEO | The clean sentence LLMs lift for entity queries; freshness signal engines reward | 4 | 2 | 4 | **6** |
| **R9** | **Entity → sector/region peer internal-link cluster** ("Compared to peers") | technical | Converts 1,256 dead-end entity pages into hubs; deepens crawl reach to the long-tail; raises dwell | 4 | 2 | 4 | **6** |
| **R4** | **Per-dimension explainer + ranking pages** (8) + a "What is institutional compassion" definitional hub | page-architecture / content | Owns the definitional class ("what is the awareness dimension") — the class AI Overviews cite most | 4 | 3 | 4 | **5** |
| **R10** | **Nonprofit schema + duplicate-content control** — `Organization`→`NGO`, add donation/`funder` posture; `noindex`+canonical the `/nonprofit-alt/*` mirror so it never collides with the live pages | technical / AEO | Prevents a 9-page duplicate-content collision at launch; establishes nonprofit entity identity | 3 | 2 | 4 | **5** |
| **R11** | **`/data` researcher hub** — CC-BY dataset downloads + citation strings + `Dataset.distribution` wiring; put it in the sitemap | page-architecture / AEO | The researcher/journalist "reach-for-this" asset + Google Dataset Search presence; every reuse is a citation | 3 | 2 | 4 | **5** |
| **R12** | **Sector taxonomy normalization** (prerequisite for R1) — the raw `sector` field is truncated/inconsistent | technical / content | Unblocks clean, non-thin faceted pages; also improves entity-page metadata quality | 3 | 2 | 4 | **5** |
| **R13** | **Wikidata entity + root `Organization.sameAs`** (founder-seeded) | AEO | Gives citations a knowledge-graph node to attribute *to us by name*; unblocks R3's cross-links | 4 | 3 | 3 | **4** |
| **R14** | **Pipeline SEO/AEO fields** — `seoTitle`, `metaDescription`, `answerFirst`, `faq[]`, `linkedEntities[]` in the briefing schema | content | Bakes R2/R7/R8/R9 into every future briefing so the freshness layer compounds into the hubs | 3 | 3 | 4 | **4** |
| **R5** | **Comparison pages** — bounded/curated "[A] vs [B] compassion score" | page-architecture | Head-to-head query class ("openai vs anthropic") — highest ceiling, but must be bounded to avoid thin-content | 4 | 4 | 3 | **3** |
| **R15** | **Static `/search` results page + `SearchAction`** — a crawlable results route so the WebSite SearchAction (sitelinks search box) becomes honest | technical | Sitelinks search box eligibility; a crawlable path into the long-tail beyond the JS Pagefind overlay | 2 | 2 | 3 | **3** |

---

## 3. Page-type specs (URL pattern · yield · template · target)

### R1 — Sector/region superlative sub-hubs (the highest-yield new type)

**Why highest-yield:** it multiplies the one query class the institution *uniquely* owns (per the live check, "institutional compassion" superlatives are uncontested) across facets that already exist in the data, at a **bounded** page count (no combinatorial thin-content risk), in exactly the list format AI Overviews cite most.

**URL patterns** (facet = an existing `metadataFields` value on each index):

| Index | Facet field | URL pattern | Approx. pages* |
|---|---|---|---|
| Countries | `region` | `/countries/region/<region>` | ~6 |
| Global cities | `region` | `/global-cities/region/<region>` | ~7 |
| US cities | `region` | `/us-cities/region/<region>` | ~4–6 |
| Fortune 500 | `sector` (normalized) | `/fortune-500/sector/<sector>` | ~20–25 |
| AI labs | `sector` / `hq` | `/ai-labs/sector/<sector>` | ~8–12 |
| Robotics labs | `category` / `country` | `/robotics-labs/category/<category>` | ~6–10 |
| Universities | `type` / `country` | `/universities/type/<type>` | ~4–8 |

\* **~60–120 pages total.** Countries/cities regions are clean and shippable now; **Fortune 500 sectors are blocked on R12** — the raw field is truncated and inconsistent (real values include `"Financial Servi"`, `"Aerospace/Defen"`, `"Government Serv"`, `"Industrial/Wate"`, and both `"Finance"` and `"Financials"`). Do **not** generate sector pages off the raw field — that yields dozens of near-duplicate, mis-labelled thin pages. Normalize first (R12), then gate each facet page on a **minimum member count** (e.g. ≥5 entities) so no page is thin.

**Template pattern:**
- **`<title>`:** `Most & Least Compassionate <Facet> <Category> (2026) — Compassion Benchmark`
- **H1:** `Most & Least Compassionate <Facet> <Category>`
- **Answer-first `<p>` (own data):** *"As of 2026, the most compassionate <facet> <category> is <Top> (<score>/100, <band>) and the least is <Bottom> (<score>/100, <band>), across <n> <category> assessed by the Compassion Benchmark."*
- **Body:** the filtered ranked subset (reuse `CrawlableRankingTable`), each row linking to the entity page.
- **Structured data:** `ItemList` (the filtered ranking) + `FAQPage` ("What is the most compassionate <facet> <category>?" / "How many are ranked?" / "How are they scored?") + `BreadcrumbList` (Index → Facet). No `Dataset` here (the parent index owns that node) — reference it via `isPartOf`.
- **Internal links:** up to the parent index, laterally to sibling facet pages, down to member entities.

**Target queries:** "most compassionate tech companies", "most compassionate energy companies 2026", "least compassionate European countries", "most compassionate universities".
**Owner:** `[FE]` route + template (one dynamic segment per index, build-time from the filtered JSON); `[BE]`/research R12 sector normalization; `[SEO]` title/answer/schema spec + the ≥5-member thin-content gate.

### R4 — Per-dimension explainer + ranking pages + definitional hub

**URL:** `/methodology/dimensions/<code>` × 8 (e.g. `/methodology/dimensions/awareness`) + `/what-is-institutional-compassion` (definitional hub).
**Yield:** 9 pages, all from real `dimensions.ts` substance (per dimension: `longDesc` + 5 subdimensions × 5 anchor levels = ~25 real anchors — ample unique content, not doorway).
**Template:** H1 "What is the <Dimension> dimension of institutional compassion?"; body = `longDesc` + the 5 subdimension ladders + a build-time **"highest- and lowest-scoring entities on this dimension"** list (real per-dimension scores, linking into entity pages — feeds the internal graph). Schema: `DefinedTerm` (referencing the existing `DefinedTermSet`) + `FAQPage`. Hub carries `DefinedTerm` for "institutional compassion" itself and links to all 8 + the 8 indexes.
**Target:** "what is the awareness dimension", "how is compassion measured", "compassion vs empathy in institutions", "what is institutional compassion".
**Owner:** `[FE]` build from `dimensions.ts`; knowledge-architect comprehension review; `[SEO]` schema + linking.

### R5 — Comparison pages (bounded — big bet, highest ceiling)

**URL:** `/compare/<slugA>-vs-<slugB>` (same index only; canonicalize ordering so `a-vs-b` and `b-vs-a` don't both exist — pick alphabetical, 301 the other in Nginx).
**Yield — BOUND IT.** The naive space is millions of pairs (1,256 choose 2) → an automatic scaled-thin-content penalty and a crawl-budget sink. Ship a **curated ~200–500** set only:
1. **Marquee rivalries** (hand-listed, real demand): OpenAI vs Anthropic, Meta vs Alphabet, USA vs China, Tesla vs Ford, etc.
2. **Adjacent-rank pairs** within each index (rank N vs N+1) — naturally interesting, naturally bounded (~1,240 max but cap per index).
3. **Same-facet leaders** (top-2 of each R1 facet).
Everything else stays as an on-page interactive comparator (no indexable URL).
**Template:** H1 "<A> vs <B>: Compassion Score Comparison (2026)"; answer-first *"As of 2026, <A> scores <n>/100 (<band>) and <B> scores <m>/100 (<band>) on the Compassion Benchmark; <higher> ranks higher."*; side-by-side 8-dimension table; `FAQPage` ("Which is more compassionate, <A> or <B>?"); `ItemList` of the two. Each page ≥ the two entities' real dimension data — genuinely unique per pair.
**Target:** "openai vs anthropic ethics/compassion", "meta vs google", "usa vs china human rights/compassion".
**Owner:** `[FE]` template + curated-pair generator; `[SEO]` the curation rules + canonical/301 policy + thin-content bound.

---

## 4. AEO/GEO citation gaps still open (make us the cited SOURCE)

1. **`FAQPage` is the biggest single AEO miss (R2).** No `FAQPage` component exists in `components/seo/` (only Dataset, Breadcrumb, DefinedTermSet, CrawlableRankingTable). FAQ Q→A pairs are what answer engines lift verbatim. Build from real fields only; render the *visible* accordion that mirrors the JSON-LD (Google requires FAQ content be on-page). Zero hand-written answers — every answer is a restatement of `composite`/`band`/`rank`/`indexTotal` or `dimensions.ts`.
2. **`sameAs` binding (R3).** 967/1,256 entities emit a typed node with **no `sameAs`**, so engines can't bind our score to the real-world entity — the live confirmation that engines return Ethisphere/Newsguard-style adjacent constructs for the compassion query is this leak made visible. The sidecar pipeline (`entity-identifiers.json`) already ships; this is verification-bound data-seeding, not engineering. Companies + labs first (highest query volume, cleanest Wikidata QIDs).
3. **Answer-first in the body, not just metadata (R8).** Post-S1 the entity answer sentence is `sr-only` but still extractable; ensure every new page type (R1/R4/R5) leads with a dated, unit-explicit, full-entity-name sentence.
4. **Special briefings are absent from the sitemap (R6).** `/updates/special/[slug]` carries Article/canonical schema but is **not enumerated in `sitemap.ts`** — our most citation-worthy long-form is under-discoverable. Add it.
5. **`ClaimReview` — explicitly REJECT.** The task flags it as a candidate; it is the wrong tool and an independence risk. `ClaimReview` marks up *fact-checks of specific third-party public claims*. Our scores are original assessments, not adjudications of someone else's claim; asserting `ClaimReview` would misrepresent the content to engines and invite "self-appointed fact-checker" criticism a nonprofit can't afford. Use `Review`/`Rating` + `Dataset` (already correct). Documented rejection > silent omission.
6. **Root `Organization.sameAs` still `[]` + no knowledge-graph node (R13).** Until a Wikidata item exists (founder), citations have nothing to attribute to. Wikidata is do-now (lower notability bar); Wikipedia/Knowledge Panel are *earned* downstream.

---

## 5. Technical SEO gaps that cap organic

1. **Sitemap is about to rot (R6).** `sitemap.ts` hard-codes `servicePages` (`/purchase-research`, `/data-licenses`, `/advisory`, `/certified-assessments`, `/enterprise`, `/contact-sales`) and `toolPages` (`/prompting-suite-for-humans`, `/ai-evaluation-suite`, `/assess-your-organization`) — most are Phase-2 deletions. When they 404, the sitemap actively points crawlers at dead pages (a soft trust hit). **Prune on the same PR that deletes the routes, and ship Nginx 301s** (→ `/support`/`/about`/`/methodology` as appropriate). Simultaneously ADD the routes that exist but are missing from the sitemap: `/updates/special/[slug]` (enumerate from the special-briefing manifest), `/data`, `/media`, `/updates/forward-watch`.
2. **`/nonprofit-alt/*` duplicate-content risk (R10).** Nine alt pages mirror nine live pages with near-identical data. They're correctly *out* of the sitemap today, but if they ship linked/crawlable they collide with the originals. Until they replace the originals, emit `robots: noindex` + a canonical pointing at the live equivalent. At cutover, 301 the old → new; never run both indexable.
3. **No crawlable `/search` (R15).** `layout.tsx` (lines 89-93) honestly omits `SearchAction` because there's no `/search?q=` route — Pagefind is a client overlay. A static `/search` shell page (Pagefind reads `?q=` on load) makes the `SearchAction` truthful and gives crawlers a route into the long-tail. Low priority but cheap.
4. **Index payload weight (~2.43MB) → CWV + crawl.** Confirm whether the Pagefind index and/or a client-shipped index bundle is loading on non-search routes; lazy-load the search index on interaction only, and confirm the ranking tables aren't shipping the full 2.43MB JSON to the client on every index page. Measure LCP on an index hub before/after. (`[FE]`/measurement.)
5. **Internal-link graph (R9).** Index→entity links exist; entity→entity is thin. Peer clusters close the long-tail crawl gap and are the single biggest engagement lever (turns 1,256 dead-ends into hubs).

---

## 6. Persona / nonprofit landing pages (SEO/AEO lens only — personas owned by growth-strategist + PM)

I own findability/citability, not persona copy or the index/product roadmap. From that lens:
- **`/data` (R11)** is the researcher-magnet with the clearest SEO/AEO payoff: CC-BY downloads + citation strings + `Dataset.distribution` make us the *reusable source* (every reuse = a citation/backlink), and it unlocks Google Dataset Search — the lane comparators (CPI) leave empty. It exists but is **not in the sitemap** (R6) and has no dataset-download wiring yet.
- **`/media` ("For Media")** is the journalist path (cite string + methodology one-pager). Exists, not in sitemap — add it (R6). Its SEO job is to rank for "compassion benchmark methodology/citation," not to convert.
- **Support/donation pages:** keep them `Organization`/`NGO`-schema'd and honest, but they are **conversion** surfaces, not organic-capture surfaces — do not optimize them for informational queries (that competes with the authority hubs and reads as SEO-for-donations). Coordinate copy with growth-strategist; I only assert the schema type (`NGO`, `funder`/`donationUrl` where a real one exists) and that they don't duplicate `/about`.

---

## 7. Quick wins (high impact / low effort — do first)

- **R6 — Sitemap remediation** (Effort 1): prune dying commercial routes + add special briefings/`/data`/`/media`; ship 301s with the deletions. Prevents self-inflicted 404s and surfaces our most citable long-form.
- **R7 — Superlative index titles ×8** (Effort 1): retitle all 8 index hubs to "Most & Least Compassionate [Category] 2026"; replicate the countries answer-block to the other 7. Title-match the head terms nobody else owns.
- **R2 — `FAQPage`** (Effort 2): the biggest AEO unlock, all from real on-page data, tiny component.
- **R8 — Answer-first body sentence + "Last assessed [date]" + `dateModified`** (Effort 2): the sentence LLMs lift + the freshness engines reward.

## 8. Big bets (high ceiling, higher effort — sequence after quick wins)

- **R1 — Sector/region superlative sub-hubs:** the **highest-yield new page type** — ~60–120 bounded pages capturing the uncontested faceted superlative long-tail. Gate Fortune sectors on R12 (taxonomy normalization); ship clean region facets first.
- **R5 — Comparison pages (bounded):** the highest *ceiling* (head-to-head query volume is large) but the highest thin-content risk — only viable curated (~200–500 pairs), never combinatorial.
- **R13 — Wikidata identity:** founder-seeded; the node every future citation attributes to. Slow-burn, compounding, unblocks R3 cross-links.

---

## 9. Independence guardrail (nonprofit-appropriate — HARD constraint)

Every recommendation is white-hat and reads as public-interest, not pay-for-visibility:
- **No pay-for-ranking optics.** Nothing here lets an entity influence its score, rank, page, or facet placement. Facet pages (R1), comparisons (R5), and superlative titles (R7) are restatements of the existing, independently-derived rankings — they add no new claim and no entity can buy into or out of them.
- **No fabricated structured data.** `sameAs` (R3), FAQ answers (R2), and dataset fields (R11) are populated *only* from real benchmark data or verified external links; where an identifier/answer doesn't exist, the field is **omitted, never guessed**. A wrong `sameAs` is an integrity failure for a benchmark, so partial coverage is the *correct* outcome.
- **No doorway/thin pages.** R1 gates every facet on a ≥5-member minimum; R5 is bounded and curated; R4 is backed by substantial real `dimensions.ts` content; the "how compassionate is X?" and 40-subdimension glossary ideas are **rejected** precisely because they'd be thin/duplicate at scale.
- **`ClaimReview` rejected** as misrepresentation (§4.5) — we don't dress assessments up as fact-checks.
- **Donation surfaces are not organic-capture surfaces** (§6) — optimizing them for informational queries would read as SEO-for-donations; keep them conversion-only and schema-honest.
- **E-E-A-T earned, not faked:** every lever here — `sameAs`, `dateModified`, `DefinedTerm`, CC-BY `Dataset`, the evidence layer's sourced quotes — is transparency made machine-readable. Verifiability *is* the authority, and it's exactly what answer engines reward.

No recommendation requires inventing a number, date, quote, rating, or link, or implying a rich result that doesn't exist.

---

## 10. Top 3 next moves · what to measure · handoffs

### Top 3 next moves
1. **Ship the quick-win pack (R6 + R7 + R2 + R8)** — sitemap remediation, superlative titles ×8, `FAQPage`, answer-first + freshness. All low-effort, high-confidence, and they make the *existing* 1,256+8 pages far more citable before any new page type is built.
2. **Seed `sameAs` for companies + labs (R3, 547 entities)** — the #1 AEO leak; verification-bound, not engineering-bound; the cleanest before/after read (named-company AEO probe prompts).
3. **Build the highest-yield new type (R1)** — region facets first (clean data), Fortune sectors after R12 normalization. This is the net-new organic surface the nonprofit needs.

### What to measure (baseline → target → how we'll know)
- **Indexation coverage** (post-remediation): 0 sitemap URLs 404, all special briefings + `/data` + `/media` indexed — GSC Pages report.
- **Non-branded superlative impressions:** near-zero → first page for ≥8 "most/least compassionate [facet]" queries in 90 days — GSC regex query filter.
- **`sameAs` coverage:** 15% (193/1,256) → ≥80% — coverage report committed beside the JSON.
- **AEO citations (by name + URL):** 0 confirmed → ≥3 engines cite us on ≥4 fixed probe prompts (incl. named-company + faceted-superlative prompts) — monthly `research/aeo-citation-log/`.
- **New-page-type organic entries:** R1/R4/R5 sessions from non-branded queries — Umami + GSC.
- **Structured-data validity:** 0 errors/warnings on the FAQ + ItemList templates — Rich Results Test.

### Handoffs
- **`[FE]` (frontend-engineer):** R1 facet template + thin-content gate, R2 `FaqJsonLd` + visible accordion, R4 dimension/hub routes, R5 curated-comparison template, R7 titles ×8, R8 body sentence + freshness stamp, R9 peer clusters, R15 `/search` shell, index-payload lazy-load (§5.4).
- **`[BE]` / research:** R3 verified `sameAs` seeding (companies + labs first) + slug-match build guard, R12 sector taxonomy normalization, R11 CC-BY dataset export + citation strings.
- **`[SEO]` (self, surgical):** R6 sitemap prune/add + Nginx 301 spec, R7 title/answer copy, R10 nonprofit schema + `noindex`/canonical on `/nonprofit-alt`, all FAQ/ItemList/Breadcrumb/DefinedTerm schema specs, the R1 thin-content and R5 curation/canonical rules.
- **`[PIPE]` (pipeline-agent):** R14 briefing-schema SEO/AEO fields + `validate-daily-briefings.mjs` rules.
- **`[FOUNDER]`:** R13 Wikidata seeding + root `Organization.sameAs`; the CC-BY-on-data decision (gates R11); confirm nonprofit tax/entity language for R10 schema.
- **Coordinate (not owned here):** persona/donation copy → growth-strategist; new indexes/products → product-manager; comprehension of R4 → knowledge-architect.

**Artifact:** `docs/ORGANIC_GROWTH_SEOAEO_2026-07-14.md` (this file).
