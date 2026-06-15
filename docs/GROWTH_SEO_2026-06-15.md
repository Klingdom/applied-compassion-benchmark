# Organic + Answer-Engine Growth Backlog — Compassion Benchmark

**Date:** 2026-06-15
**Author:** seo-aeo-architect
**Companion to:** `docs/SEO_AEO_AUDIT_2026-06-11.md` (the 20-item technical backlog) and `docs/SEO_AEO_TOP10_STRATEGY_2026-06-11.md` (the off-site authority strategy).
**Scope of THIS doc:** the *traffic* question only — what now most increases **non-branded organic sessions + answer-engine citations + the clicks/engagement that follow**. Strategy/spec only; no code changes this pass.
**Canonical host:** `https://compassionbenchmark.com` · static export (Next.js 16) · Nginx + Cloudflare Worker for dynamic concerns.

This is not a re-audit. The audit told us *what is broken*; this tells us *which traffic levers to pull, in what order, to grow non-branded demand* — grounded in what already shipped (typed entity JSON-LD, Dataset schema, llms.txt, AI-crawler allow, breadcrumbs, DefinedTermSet, answer-first sentences, 193 country `sameAs`).

---

## 1. Where the traffic actually is — the three query classes we must own

Every organic session we want falls into one of three demand classes. We already serve the *pages* for two of them; we don't yet *win the SERP feature* for any. The growth job is to convert "page exists" into "page is the answer."

### Class A — **Entity queries** (long-tail, highest conversion, 1,160 pages of supply)
`"<entity> compassion score"`, `"is <entity> compassionate"`, `"<entity> compassion benchmark"`, `"how does <entity> treat <stakeholder>"`.
- **Supply:** all 1,160 entity pages already exist, already titled `<Entity> — Compassion Score <n> (<band>)`, already carry a typed `Review` + answer-first metadata. This is the single largest organic asset we own.
- **The gap is demand-capture, not supply:** (1) only **193/1,160** entities have `sameAs` (countries only) — so for ~967 entities answer engines cannot bind our score to the real-world entity, the #1 citation leak; (2) no `FAQPage` on entity pages, so we forfeit the "People also ask" / AI-Overview Q-block these queries trigger; (3) entity → entity internal links are thin, so the long-tail is under-crawled and under-linked.
- **Why it matters most:** entity queries are low-competition (we are often the *only* entity scoring "<company> compassion"), high-intent, and they compound — every one of 967 unseeded entities is a query class we forfeit today for lack of one verified link.

### Class B — **Superlative queries** (head terms, highest impressions, 7 hubs + ~20 sub-hubs of supply)
`"most/least compassionate countries 2026"`, `"most compassionate companies"`, `"least compassionate AI labs"`, `"most compassionate cities"`, and per-region/per-sector cuts.
- **Supply:** 7 index pages. `countries/page.tsx` now leads with a real answer-first superlative sentence (lines 57-69) — good — but the **`<title>` is still `"World Countries Index 2026"`** (line 16), which does NOT match the query `"most compassionate countries 2026"`. Same on all 7 indexes.
- **The gap:** (1) titles/H1s don't carry the superlative phrasing engines and humans search; (2) no `FAQPage` answer block on indexes; (3) no per-sector/per-region superlative landing pages (e.g. "most compassionate AI labs", "most compassionate European countries") even though the data to back them exists in the rankings. Answer engines *love* "most/least X" lists — these are the queries that trigger AI Overviews most reliably, and we leave the title-match on the table.
- **Why it matters:** these are the highest-impression head terms. Owning them is how non-branded impressions go from near-zero (audit baseline) to a real curve.

### Class C — **Informational queries** (top-of-funnel, authority-building, almost no supply yet)
`"what is institutional compassion"`, `"how is compassion measured"`, `"what is the Awareness dimension"`, `"compassion vs empathy in institutions"`, `"how to assess organizational compassion"`.
- **Supply:** essentially one page — `/methodology` — a single monolith covering all 8 dimensions + 5 bands + evidence model. `dimensions.ts` holds rich, real, substantial copy for **8 dimensions × 5 subdimensions each** (`longDesc`, `desc`, 5 anchored levels) that is currently *only* rendered inside the methodology wall and never given its own URL.
- **The gap:** no landing page answers "what is institutional compassion" as a definition, and no page answers "what is the <dimension> dimension" — so these top-of-funnel queries (which seed brand familiarity and feed every other class) have nowhere to rank. This is genuine substance-backed content, not doorway pages.
- **Why it matters:** informational queries are how we *create* the demand for Class A/B before people know the brand. They are also the most-cited class in AI Overviews (definitional answers).

**The synthesis:** Class A is supply-rich/demand-leaking (fix the leaks, ×967). Class B is the head-term we half-own (finish the title + FAQ + sub-hubs). Class C is the demand-creation layer we haven't built (extract what `dimensions.ts` already contains into ranked pages). All three are won by the same three mechanics: **disambiguation (`sameAs`), extractable answer blocks (`FAQPage` + superlative leads), and the internal-link graph that lets the long-tail be found.**

---

## 2. The ranked growth backlog

**Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (each 1–5; Priority = net).
**Owner key:** `[SEO]` seo-aeo-architect surgical · `[FE]` frontend-engineer · `[BE]` backend-engineer · `[PIPE]` pipeline-agent · `[FOUNDER]` Phil-only.
**Effort:** S ≤1 day · M ≤1 week · L multi-week.

| # | Move | Class | Owner | Impact | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|---|
| **G1** | **Seed `sameAs` for the non-country indexes** (companies, AI/robotics labs, cities, states) — extend the win from 193 → ~1,160 | A | [FOUNDER]+[BE]+[SEO] | 5 | 2 | 1 | **+15** |
| **G2** | **`FAQPage` on entity + index pages** (real Q&A from on-page data) — wins AI-Overview / PAA blocks | A,B | [FE]+[SEO] | 5 | 2 | 1 | **+14** |
| **G3** | **Superlative index titles + H1 + per-page answer block** ("Most & Least Compassionate `<category>` 2026") | B | [FE]+[SEO] | 5 | 2 | 1 | **+14** |
| **G4** | **Per-dimension explainer pages** `/methodology/dimensions/<code>` (8 pages from real `dimensions.ts`) + "what is institutional compassion" hub | C | [FE]+[SEO]+knowledge-architect | 4 | 3 | 1 | **+11** |
| **G5** | **Entity → sector/region-peer internal-link cluster** ("compared to peers") — lights up the 1,160 long-tail | A | [FE] | 4 | 2 | 1 | **+12** |
| **G6** | **Per-category/region superlative sub-hubs** (e.g. `/ai-labs` "most compassionate AI labs", regional cuts) | B | [FE]+[SEO] | 4 | 3 | 2 | **+10** |
| **G7** | **Real freshness signals**: "Last assessed `<date>`" + `dateModified` in JSON-LD + sitemap `lastModified` from history | A,B | [BE]+[FE] | 3 | 2 | 1 | **+9** |
| **G8** | **Pipeline SEO/AEO fields** (`seoTitle`, `metaDescription`, `answerFirst`, `faq[]`, `linkedEntities[]`) — bakes G2/G3/G5 into every future briefing | A,B,C | [PIPE]+[BE]+[SEO] | 4 | 3 | 1 | **+11** |
| **G9** | **Briefing → entity hub-and-spoke linking** (freshness layer feeds the evergreen hubs) | A | [PIPE]+[FE] | 3 | 2 | 1 | **+9** |
| **G10** | **Measurement: GSC/Bing verification + AEO citation probe log + GSC query-class dashboard** | all | [FOUNDER]+[SEO] | 4 | 1 | 1 | **+13** |

---

## 3. The highest-leverage organic move

**G1 — seed `sameAs` for the ~967 non-country entities — is the single highest-leverage organic/AEO move, and it is uniquely low-effort because the entire machinery already exists.**

The plumbing shipped already: `entities.ts` reads a sidecar `entity-identifiers.json` keyed by `kind → slug → {wikidata, wikipedia, officialSite}` (lines 92-116, 309), merges it into `Entity.identifiers`, and the entity template already renders it into the typed `Review.itemReviewed.sameAs/url`. The country half is done (193 verified entries). **For the other six kinds the registry is empty** (grep confirms zero `company`/`ai-lab`/`robotics-lab`/`city`/`us-city`/`us-state` keys). So 967 entity pages currently emit a typed `Review` with **no `sameAs`** — answer engines cannot bind "our Meta compassion score" or "our Tokyo compassion score" to the real-world entity, which is exactly the attribution failure the audit flagged as the #1 AEO leak, now ×967.

Why it is the top lever:
- **Pure data-seeding into an existing, validated pipeline.** No template change, no schema change, no build-system change. Add verified rows to `entity-identifiers.json`; the JSON-LD lights up automatically across 967 pages. Effort is dominated by *verification*, not engineering.
- **It is the prerequisite that unlocks the entire Class-A long-tail.** Entity queries (`"<company> compassion score"`) are our largest, lowest-competition supply. Disambiguation is what lets answer engines cite us *by name and bound to the right entity* — without it, the 967 pages can rank for humans but get passed over for citation.
- **Companies and labs are the most-searched, most-citable entities** (Meta, OpenAI, Amazon, Tesla have enormous query volume and active AI-Overview coverage), and they are the entities most likely to have a clean, unambiguous Wikidata QID — verification is fast and reliable for them.
- **White-hat by construction:** every entry is a verified link to the real entity (the country registry already documents the verification protocol in its `_comment`); where no confident match exists, the field is omitted, never guessed. A wrong `sameAs` is an integrity failure for a benchmark institution, so partial coverage is the *correct* outcome.

**Sequencing within G1 (verification cost order):** Fortune 500 companies (447 — almost all have a clean Wikidata QID + official site) → AI labs (50) + robotics labs (50, watch for parent-company ambiguity, e.g. "Boston Dynamics" the lab vs Hyundai parent) → global cities (250) + US cities (144, use `City`/`AdministrativeArea` QIDs, disambiguate same-name cities) → US states (21, trivially clean). Companies + labs alone (547 entities, fast verification) capture the bulk of the citable query volume and should be Wave 1 of G1.

---

## 4. Implementable specs — the top traffic moves

> Every value traces to real benchmark data or a verified external link. No fabricated `sameAs`, FAQ, rating, or quote. Where a fact doesn't exist, the field is omitted.

### G1 — Seed `sameAs` for non-country indexes

**Where:** `site/src/data/entity-identifiers.json` (existing file — extend, don't replace). Keyed by `kind → slug → identifiers`. Slugs must match `entities.ts` slug generation (kebab-case, collision-disambiguated with `-<rank>` suffix — verify against `getAllSlugs(kind)` output, not raw names).

**Shape (per the existing country rows):**
```jsonc
{
  "company": {
    "meta-platforms": {
      "wikidata": "https://www.wikidata.org/wiki/Q380",
      "wikipedia": "https://en.wikipedia.org/wiki/Meta_Platforms",
      "officialSite": "https://about.meta.com/"
    }
  },
  "ai-lab": {
    "openai": {
      "wikidata": "https://www.wikidata.org/wiki/Q21708200",
      "wikipedia": "https://en.wikipedia.org/wiki/OpenAI",
      "officialSite": "https://openai.com/"
    }
  }
  // cities/labs/states follow the same shape
}
```
**Verification protocol (reuse the country `_comment` standard):** each QID confirmed against the live Wikidata API for label + enwiki sitelink + `instance of` matching the kind class (company → business/organization; city → city/municipality; state → US state). `officialSite` only where it is the entity's own canonical homepage. **No row without verification.**

**One template enhancement that should ride along (`renderEntityPage` itemReviewed type):** companies/labs already map to `Organization` (correct); confirm cities map to `City`, US states to `AdministrativeArea`, countries to `Country` (audit Top-1 per-kind type map). If the type map isn't yet per-kind, fix it in the same pass so the seeded `sameAs` attaches to the correct typed node.

**Acceptance:** Rich Results Test = 0 errors on one page per kind; `sameAs` present on every entity with a verified identifier; coverage report (count of seeded ÷ total per kind) committed alongside the JSON. **Target:** companies + labs (547) within Wave 1; ≥80% of all 1,160 within 60 days.

**Owner:** `[FOUNDER]`/research does verification (or supervises an enrichment pass that is then spot-checked); `[BE]` validates slug-match + adds a build-time guard that every key resolves to a real entity slug (fail the build on an orphan key — mirrors the index-schema guard); `[SEO]` confirms the JSON-LD wiring.

---

### G2 — `FAQPage` on entity + index pages (real Q&A only)

This is the move that wins the "People also ask" / AI-Overview Q-block for Class A + B. There is **no `FAQPage` component in `site/src/components/seo/`** today (only Dataset, Breadcrumb, DefinedTermSet, CrawlableRankingTable) — this is net-new but tiny.

**Entity-page FAQ (build-time, from `Entity` fields — zero fabrication):**
```jsonc
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question",
      "name": "What is Meta Platforms' compassion score?",
      "acceptedAnswer": { "@type": "Answer",
        "text": "As of <lastAssessed>, Meta Platforms scores <composite>/100 (<band>) on the Compassion Benchmark, ranking #<rank> of <indexTotal> in the Fortune 500 Index." } },
    { "@type": "Question",
      "name": "How is the compassion score calculated?",
      "acceptedAnswer": { "@type": "Answer",
        "text": "The score is a composite across 8 dimensions of institutional compassion... See the methodology." } },
    { "@type": "Question",
      "name": "Where does Meta Platforms rank on compassion?",
      "acceptedAnswer": { "@type": "Answer",
        "text": "#<rank> of <indexTotal> in the Fortune 500 Index, in the <band> band." } }
  ]
}
```
The visible page MUST contain the same Q&A text (Google requires FAQ content be visible on the page) — render an accessible `<details>`/accordion "Frequently asked" section that mirrors the JSON-LD. Every answer is a literal restatement of `composite`, `band`, `rank`, `indexTotal` — no new claims.

**Index-page FAQ:** "What is the most compassionate `<category>` in 2026?" / "...least compassionate?" / "How many `<category>` are ranked?" / "How are they scored?" — answers pulled from `data.rankings[0]`, `data.rankings[at -1]`, `data.meta`.

**Anti-fabrication guard:** answers are template-generated from real fields only; no free-text. A question we cannot answer from on-page data is not added.
**Acceptance:** Rich Results Test shows valid FAQ on one entity + one index sample; visible Q&A matches JSON-LD; zero hand-written answers. **Owner:** `[FE]` new `FaqJsonLd` + visible accordion component; `[SEO]` the question/answer templates.

---

### G3 — Superlative index titles + H1 (the Class-B title-match)

**Where:** the `metadata` export + H1 in each of the 7 index pages (`countries/page.tsx` line 16, and siblings). The answer-first body sentence is already correct on countries (lines 57-69) — replicate it to the 6 other indexes and fix the **titles** to match the superlative query.

**Title pattern (front-loaded superlative + year + brand):**
```ts
// countries/page.tsx
export const metadata: Metadata = {
  title: "Most & Least Compassionate Countries 2026 — Compassion Benchmark",
  description:
    "See which countries rank most and least compassionate in 2026. The Compassion Benchmark scores 193 countries across 8 dimensions of institutional compassion, from awareness to integrity.",
};
```
Per-index nouns: countries / companies (Fortune 500) / AI labs / robotics labs / cities (global) / U.S. cities / U.S. states. The visible H1 should also carry the superlative framing (currently `"World Countries Compassion Benchmark Index 2026"` — keep brand but lead the user-facing phrasing toward "most & least compassionate").

**Acceptance:** title contains "Most & Least Compassionate `<category>` 2026"; description ≤155 chars, answer-first; all 7 indexes have the answer-first body `<p>` (countries already does). **Target:** first page for ≥5 superlative queries within 90 days (GSC). **Owner:** `[FE]` (metadata + H1 across 7 pages); `[SEO]` copy spec.

---

### G4 — Per-dimension explainer pages + "what is institutional compassion" hub (Class C demand-creation)

**The content already exists** — `dimensions.ts` has, per dimension: `name`, `desc` (the framing question), `longDesc` (a real 1-2 sentence definition), and 5 subdimensions each with `name`, `desc`, and 5 ordered `anchors`. That is more than enough substance for 8 genuine explainer pages — it is currently locked inside the `/methodology` monolith with no individual URL.

**Proposed routes (static, build-time from `dimensions.ts`):**
- `/methodology/dimensions/<code>` × 8 (e.g. `/methodology/dimensions/awareness`) — H1 "What is the Awareness dimension of institutional compassion?", body = `longDesc` + the 5 subdimensions + their anchor ladders, plus a build-time list of "highest-scoring / lowest-scoring entities on this dimension" (real data, links into entity pages — feeds the internal graph).
- `/what-is-institutional-compassion` (or `/methodology/institutional-compassion`) — the definitional hub answering the top-of-funnel query, linking down to all 8 dimension pages and out to the 7 indexes.

**Schema:** each dimension page carries `DefinedTerm` (referencing the existing `DefinedTermSet`) + `FAQPage` ("What is the <dimension> dimension?" / "How is it scored?"). The hub carries `DefinedTerm` for "institutional compassion" itself.

**Independence:** these are substance-backed informational pages, NOT doorway pages — every word traces to `dimensions.ts` or real rankings. The "top entities on this dimension" lists are restatements of existing scores.
**Acceptance:** 8 dimension pages + 1 hub indexed; each ≥300 words of unique real content; each linked from `/methodology` and from every entity page's dimension breakdown. **Owner:** `[FE]` builds routes from `dimensions.ts`; knowledge-architect reviews comprehension; `[SEO]` schema + internal-link spec.

---

### G5 — Entity → peer internal-link cluster (light up the long-tail)

**Where:** entity template (`renderEntityPage` / `EntityDetail`). Add a "Compared to peers" block: the 3–5 nearest-rank entities **of the same kind and same sector/region** (companies by `metadata.sector`, cities by `metadata.region`/`country`, labs by `metadata.category`/`sector`), plus a link up to the index and to any briefing that discusses the entity.

**Why it grows traffic:** the index→entity links exist (RankingTable + CrawlableRankingTable) but entity→entity is thin, so the 1,160 long-tail is shallow in the link graph. Peer clusters (a) deepen crawl reach to every entity in ≤3 hops, (b) pass topical relevance laterally, (c) give humans the comparison they came for (raises engagement/dwell). Descriptive anchors — "OpenAI (Compassion Score 52.3, Functional)" — never "click here".
**Acceptance:** every entity page links to ≥3 same-sector/region peers + its index; internal-orphan count = 0 (pair with the proposed link-graph build check). **Owner:** `[FE]`.

---

### G7 — Real freshness signals

Answer engines and search both favor *demonstrably current* data, and we currently under-signal it: entity pages with history show a stamp, those without show none, and there's no `dateModified` in the entity JSON-LD. **Fix:** always render "Last assessed `<date>`" (from latest history/evidence-review date, else publication date); add `dateModified` to the entity `Review` JSON-LD; drive sitemap `lastModified` from real history dates (not `now` on every build). Pure truth-telling about real assessment dates — white-hat. **Owner:** `[BE]` (dates + sitemap), `[FE]` (visible stamp).

---

### G8 / G9 — Bake it into the pipeline (compounding)

So the daily/special briefings *ship* the above instead of having it reverse-engineered: extend the briefing schema (`DAILY_BRIEFING_SCHEMA.md`) + `overnight-digest`/`special-briefing` prompts to emit `seoTitle`, `metaDescription` (answer-first ≤155 chars), `answerFirst` lead sentence, `faq[]` (real Q&A derived from the briefing's own cited evidence — reuse the `EvidenceItem` URL-required guard), and `linkedEntities[]` (slugs the briefing discusses → required in-body internal links into the evergreen hubs). Enforce in `validate-daily-briefings.mjs` for dates ≥ a cutoff. This makes every future briefing a freshness spoke that feeds the entity/index hubs (G9), compounding the link graph daily. **Owner:** `[PIPE]` + `[BE]` + `[SEO]` spec.

---

## 5. Measurement — prove the traffic moved (G10)

Off-site citation can't be auto-measured on a static + Cloudflare + Umami stack; on-site organic needs Search Console. Both gates must close first or none of the above is provable.

| Metric | How (this stack) | Baseline | 90-day target |
|---|---|---|---|
| **GSC + Bing verified** | DNS TXT or `/public` token on static host | unconfirmed | verified (gates everything) |
| **Non-branded impressions** (entity + superlative regex query filter) | GSC Performance | ~near-zero | rising curve; ≥20 entity queries + first page on ≥5 superlative queries |
| **Entity-query coverage** | GSC: # of `"<entity> compassion"` queries with impressions | low | ≥100 entities with non-branded impressions |
| **AI-Overview / FAQ rich-result wins** | manual SERP check on 15 fixed superlative + entity queries | 0 | ≥5 queries showing our FAQ/answer block |
| **AEO citations** (by name + URL) | monthly manual probe, ChatGPT/Perplexity/Gemini/Claude/Google AIO, 12 fixed prompts → `research/aeo-citation-log/<date>.md` | 0 confirmed | ≥3 engines cite us by name on ≥4 prompts (esp. the superlative + named-company prompts unlocked by G1) |
| **`sameAs` coverage %** | count seeded ÷ 1,160 per kind, committed beside the JSON | 17% (193/1,160) | ≥80% |
| **Engagement from organic** (sessions, entity-page dwell, briefing→entity clicks) | Umami events | — | rising entity-page sessions from non-branded entries |

**Probe-prompt design (the leading indicator for G1+G2+G3):** include named-company prompts (`"what is Meta's compassion score"`, `"is Amazon a compassionate company"`) that are *only* answerable-by-us once `sameAs` is seeded — these become the cleanest before/after read on whether G1 worked.

---

## 6. Independence check

Every move is white-hat and authority is earned through transparency, never manufactured:
- **No fabricated schema/links/FAQ.** G1 `sameAs` entries are each verified against the live Wikidata API (reusing the country registry's documented protocol); unmatched entities get *no* link. G2/G4 FAQ answers are template restatements of real `Entity`/`dimensions.ts` fields — no hand-written or invented Q&A. G8 briefing FAQ answers must derive from the briefing's own cited evidence.
- **No doorway/thin pages.** G4 dimension pages are backed by real `dimensions.ts` substance (longDesc + 5 subdims + 25 anchors each); G6 superlative sub-hubs restate existing rankings. Neither adds a new claim.
- **No keyword stuffing / cloaking.** G3 superlative titles are accurate descriptions of what the page is; G5 anchors are descriptive entity names; answer blocks are identical for humans and machines.
- **No link schemes.** G5/G9 internal links are between our own real, related pages.

No move requires inventing a number, date, quote, rating, or link, or implying a rich result that doesn't exist.

---

## 7. Top 3 next moves · what to measure · handoffs

### Top 3 next moves
1. **G1 — seed `sameAs` for companies + AI/robotics labs first (547 entities).** Highest leverage, lowest engineering effort (the pipeline already exists), unlocks the entire Class-A entity long-tail for citation. Verification-bound, not code-bound.
2. **G2 + G3 — `FAQPage` everywhere + superlative index titles.** The two moves that win the AI-Overview / PAA blocks and title-match the highest-impression head terms. Both are small, surgical, white-hat restatements of existing data.
3. **G10 — close the measurement gates (GSC/Bing + AEO probe log).** Until GSC is verified and the citation probe is running, we cannot prove G1/G2/G3 worked — and the named-company probe prompts are the cleanest read on G1.

### What to measure
Non-branded impressions (entity + superlative query classes), `sameAs` coverage % (193→≥80% of 1,160), AI-Overview/FAQ rich-result wins on 15 fixed queries, and AEO citations by name on the named-company probe prompts (the G1 leading indicator). Baselines and targets in §5.

### Handoffs
- **[FOUNDER]/research:** G1 identifier verification (companies + labs first); G10 GSC + Bing verification.
- **[BE]:** G1 slug-match build guard + coverage report; G7 dates + sitemap `lastModified`; G8 schema fields + validator.
- **[FE]:** G2 `FaqJsonLd` + visible accordion; G3 superlative titles/H1 ×7; G4 dimension explainer routes + hub; G5 peer-link cluster; G6 superlative sub-hubs; G7 visible "last assessed" stamp; G9 briefing→entity link render.
- **[PIPE]:** G8 `overnight-digest`/`special-briefing` prompt edits + briefing schema; G9 required `linkedEntities[]`.
- **knowledge-architect:** G4 comprehension review of dimension explainers.
- **[SEO] (self, surgical):** all schema/title/FAQ/internal-link specs above; wiring once data lands.

**Artifact:** `docs/GROWTH_SEO_2026-06-15.md` (this file).
