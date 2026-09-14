# PR/FAQ Review — Discoverability & Citability (SEO / AEO)

Reviewer: seo-aeo-architect · Date: 2026-09-14 · Programs: (1) CB-MODEL `/ai-models` pre-registration; (2) continuous institutional research & scoring.

Live observations below were taken read-only on 2026-09-14 during this session, while a data fix and deploy were in flight. Anything marked **[live]** may change after that deploy. Anything marked **[src]** was read from the working tree on branch `nightly-research-2026-07-24-27`. No builds were run, no git commands were used, and no existing files were edited.

---

## 1. Scope

**Source files checked**
- Crawl layer: `site/src/app/sitemap.ts`, `site/src/app/robots.ts`, `site/src/app/layout.tsx` (Organization + WebSite JSON-LD), `site/next.config.ts`
- Structured data: `site/src/components/seo/DatasetJsonLd.tsx`, `site/src/components/entity/renderEntityPage.tsx` (Review, FAQPage and BreadcrumbList on ~1,325 entity pages), `site/src/components/entity/renderHistoryPage.tsx`, `site/src/app/updates/[date]/page.tsx` (NewsArticle), `site/src/app/updates/special/[slug]/page.tsx` (Article), the 8 index `page.tsx` files, `site/src/app/page.tsx`
- CB-MODEL: `site/src/app/ai-models/page.tsx`, `site/src/app/ai-models/methodology/page.tsx`, `site/src/lib/model-index-facts.ts`, `site/src/app/ai-evaluation-suite/page.tsx`, `site/src/data/model-benchmark/tasks-v1.json` (bankVersion v1.1), `DECISIONS.md` D-29/D-30, prior spec `docs/SEO_AEO_MODEL_BENCHMARK.md`
- Machine surfaces: `site/scripts/build-llms.mjs`, `site/scripts/build-feeds.mjs`, `site/scripts/export-public-data.mjs`, `worker/src/index.ts` (badge), `site/src/data/entities.ts` + `entity-identifiers.json`
- Citation guidance: `site/src/app/cite/page.tsx`
- Vocabulary: `site/src/data/dimensions.ts`, `site/src/data/glossary.ts`
- Edge: `Dockerfile` (ships `nginx.conf`, not `nginx-ssl.conf`), `nginx.conf`, `nginx-ssl.conf`

**Live URLs checked [live]**
`/ai-models`, `/robots.txt`, `/llms.txt`, `/sitemap.xml`, `/updates/feed.json`, `/data/scores/singapore.json`, `/country/singapore`, `/country/this-entity-does-not-exist`, `/country/cabo-verde/` (trailing slash), `/fortune-500/microsoft` (the /cite example URL), `/countries-index` (legacy redirect), `/404`, `/countries`.

**Web searches (2 of the shared 10):**
- `"Compassion Benchmark" compassionbenchmark.com`
- `AI model compassion benchmark which LLM is most compassionate`

---

## 2. What is working

1. **Deliberate AI-crawler stance.** `robots.ts:12-33` explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, CCBot and others, and documents why. It is served correctly [live].
2. **The pre-registration page is honestly citable.** `/ai-models` opens with an extractable zero-statement: "The method is published. No model has been scored yet… evaluated 0 AI models" [live].
   - Every number comes from `model-index-facts.ts` at build time, never hand-typed.
   - `Dataset`/`ItemList` are gated on `hasResults` (`ai-models/page.tsx:16-18`, D-29).
   - The FAQ answers the highest-risk query directly: "Which AI model is the most compassionate?" → "No model has been scored… any ranking… attributed to Compassion Benchmark today would be fabricated" (`ai-models/page.tsx:32-37`). This is the right way for a pre-registration page to rank without implying results.
3. **Branded discovery works.** The branded web search returns `/countries` ("Most & Least Compassionate Countries 2026"), entity pages such as `/company/principal-financial` ("Principal Financial — Compassion Score 60.9 (Established)") and `/us-city/san-jose`. The engine summary reuses our framing: 8 dimensions, 0–100, and the independence statement. Entity title templates (`renderEntityPage.tsx:94`) are query-shaped and front-loaded.
4. **Entity pages carry a full structured-data set:**
   - Per-kind schema types: Country, City, CollegeOrUniversity, AdministrativeArea (`renderEntityPage.tsx:167-177`)
   - Real-data FAQ answers with an "As of <date>" lead (`:408-429`)
   - BreadcrumbList
   - A self-canonical (`:97-101`)
   - `sameAs` emitted only from a verified sidecar. `entity-identifiers.json` holds 761 Wikidata URLs, merged in `entities.ts:279-295`, and nothing is fabricated.
5. **Briefings are dated and have stable URLs.** Per-date and per-slug canonicals, `datePublished`/`dateModified` from `generatedAt`, an OG image per briefing, and sitemap `lastmod` equal to the briefing date (`sitemap.ts:114-130`).
6. **Dataset JSON-LD on all 8 indexes** with a real JSON `DataDownload` (`DatasetJsonLd.tsx:34-47`). The license field is withheld pending a founder decision rather than guessed (`:10-13`).
7. **`/404` itself returns a true 404 status** [live], so this is not a soft-404 page.

---

## 3. Findings

Severity: **H** = actively breaks citation or identity; **M** = degrades ranking, trust or freshness; **L** = hygiene.

| # | Sev | Finding | Evidence | System |
|---|---|---|---|---|
| F1 | **H** | **The /cite page teaches a citation URL pattern that does not exist.** It tells readers entity URLs are `compassionbenchmark.com/[index]/[slug]`, e.g. `/fortune-500/microsoft`. Real routes are kind-singular: `/company/microsoft`, `/country/…`, `/ai-lab/…`. Every citation that follows our own instructions is a dead link. | `site/src/app/cite/page.tsx:158-165` [src]. `https://compassionbenchmark.com/fortune-500/microsoft` → **301 Location: `http://compassionbenchmark.com/404`** [live]. The sitemap uses `/company/target` etc. [live]. | Site content |
| F2 | **H** | **Every missing URL returns 301 → `http://…/404`, not a 404.** Nginx's `error_page 404 /404.html` internal redirect is re-processed by the server-level strip rule `rewrite ^/(.+)\.html$ /$1 permanent`. The Location is absolute and `http://` because the container listens on :80 behind a TLS-terminating proxy. Consequences: dead citations look "moved", link checkers and answer engines can follow them to a page, and the original URL never returns its own 404. | `nginx.conf:29,55,70-73`; `Dockerfile:26` (ships `nginx.conf`). Live: `/country/this-entity-does-not-exist` → 301 `http://compassionbenchmark.com/404`; `/404` → 404. | Nginx |
| F3 | **H** | **All permanent redirects emit `http://` Locations,** adding a hop for crawlers. This includes legacy URLs and the new `cape-verde → cabo-verde` merge from today's data fix. The same absolute-redirect behaviour affects every `rewrite … permanent` rule. | `/countries-index` → 301 `http://compassionbenchmark.com/countries` [live]. `nginx.conf:33-55`. (The http→https hop could not be observed directly: WebFetch auto-upgrades http. HSTS exists only in the unused `nginx-ssl.conf:45`.) | Nginx |
| F4 | **H** | **Trailing-slash URLs 404,** via the same 301→http /404 path. `try_files $uri $uri/index.html $uri.html` does not match `/x/`. Many CMSs, reference managers and LLM outputs append a slash. There is no normalisation. | `/country/cabo-verde/` → 301 `http://…/404` [live]. `nginx.conf:29`. | Nginx |
| F5 | **H** | **The public score API binds the wrong entity for colliding slugs.** `/data/scores/singapore.json` returns the *city* (`indexSlug: global-cities`, 56.2 Functional), while `/country/singapore` shows 62.2 Established, #36 of 193. The flat namespace overwrites silently; the build only warns. The Worker badge resolves by bare slug, so embedded badges (our most durable backlinks) inherit the error. This is the identity failure answer engines are most sensitive to: one name, two numbers, both from us. | `export-public-data.mjs:142-164` (warn, then `writeFileSync` to `scores/${slug}.json`); `worker/src/index.ts:313,324`. Live JSON shows `updatedAt: 2026-09-11T19:27:14Z`. The coordinator counts 18 collisions. | Build script + Worker |
| F6 | **M** | **`llms.txt` omits CB-MODEL entirely** and states a hardcoded "1,260+ entities in 8 indexes". It has no generation date and no links to `/cite`, `/data`, `/glossary`, `/dimensions` or `/data/indexes/*.json`. The prior spec's R3 (Model Index status line + lab↔model separation) did not ship. An LLM that reads "AI labs… scored" can plausibly infer we score models. | `build-llms.mjs:26-65` [src] (static template); `/llms.txt` [live] has no `/ai-models`. `docs/SEO_AEO_MODEL_BENCHMARK.md` §6.4, §7.3. | Build script |
| F7 | **M** | **Name collision with "CompassionBench"** (compassionbench.com, CaML). It publishes an "AI Compassion Leaderboard" that **does rank named models** (non-human-welfare focus). For the query class CB-MODEL targets, the engine summary cites CompassionBench's leaderboard and other empathy benchmarks. Our `/ai-models` does not appear. The risk is misattribution in both directions: their model scores attributed to "Compassion Benchmark", or our 0-scored status contradicted. Nothing on our side disambiguates: no `alternateName`/`disambiguatingDescription` on the Organization and no line on `/ai-models`. | WebSearch 2 results (compassionbench.com/mcb, "AI Compassion Leaderboard"); compassionbench.com returns 403 to WebFetch. `layout.tsx:57-87`. | Content + JSON-LD |
| F8 | **M** | **Missing self-canonicals on key citation targets:** `/ai-models`, `/ai-models/methodology`, the home page and all 8 index pages. Canonicals exist only on entity, history, briefing, dimension, glossary, cite, methodology, `/indexes` and ai-evaluation-suite pages. The index pages are the Dataset landing URLs, so the `Dataset.url` has no matching canonical. | `countries/page.tsx:17-21`, `ai-models/page.tsx:20-26`, `ai-models/methodology/page.tsx:17-23` have no `alternates` [src]. Grep for `canonical` across `site/src/app/**/page.tsx` matches 13 files, none of them index or ai-models pages. | Metadata |
| F9 | **M** | **Structured data contradicts the site's own dimension vocabulary.** The canonical dimension name is "Systemic Thinking" (`dimensions.ts:442`, `glossary.ts:138`). `DatasetJsonLd` `variableMeasured` says "Systemic Impact (SYS)" (`DatasetJsonLd.tsx:66`), and so does the entity FAQ JSON-LD answer template (`renderEntityPage.tsx:415`). That is ×8 Datasets and ×~1,325 FAQPage blocks. Engines learning our framing get two names for SYS. | Files and lines cited [src]. | JSON-LD |
| F10 | **M** | **Freshness signals are flattened or faked by default:** (a) sitemap `lastmod = now` for every entity, history, index and ai-models URL, so every build claims ~2,000 pages changed (all live entity lastmods are identical, `2026-09-11T19:29:51.035Z`), which trains Google to ignore our lastmod; (b) entity `Review.datePublished` is hardcoded `"2026-01-01"` and `dateModified` falls back to it (`renderEntityPage.tsx:181,222`); (c) with no history, the FAQ says "As of 2026" (`:406`). Real per-entity dates exist (latest score change, evidence `reviewed_at`) but are not used in the sitemap. | `sitemap.ts:26,136,151` [src]; live sitemap [live]. | Sitemap + JSON-LD |
| F11 | **M** | **Public daily freshness lapsed** [live]. The latest feed item is `2026-09-01`, preceded by 08-26, 08-20, 08-18, 08-11 and 08-01. The local manifest reports `"latest": "2026-09-14"` (`site/src/data/updates/manifest.json:115`), so the deploy in flight may close this. Feed items carry **no `authors`**, and **special briefings are absent from both feeds** (`build-feeds.mjs:35,320` reads only the daily manifest). | Feed [live]; files [src]. | Pipeline + feeds |
| F12 | **M** | **Stale scope figures already propagate into answer engines.** The home page hardcodes "207 countries and territories" (`page.tsx:231,743`), against 191 local and 193 live rows. The engine's summary of Compassion Benchmark repeats "207 countries… 50 humanoid robotics labs"; the robotics index has 92. This is the same defect class D-29 warns about, now on the most-quoted page. | `site/src/app/page.tsx:231,743` [src]; WebSearch 1 summary; `robotics-labs.json` holds 92 composites [src]. | Site content |
| F13 | **M** | **The one honest pre-result CB-MODEL dataset is not marked up or exported.** The 33-item task bank (`tasks-v1.json`, bankVersion v1.1) has no `Dataset` JSON-LD on `/ai-evaluation-suite`, and `site/public/data/model-benchmark/` does not exist. Prior spec R4 did not ship. CB-MODEL therefore has **no** machine-readable artifact to be cited from, only prose pages. | Glob of `site/public/data/model-benchmark/**` finds nothing; `ai-evaluation-suite/page.tsx` has no JsonLd import [src]. | Build script + JSON-LD |
| F14 | **M** | **The `/ai-models` identity graph is thin:** (a) no `WebPage` node with `dateModified`/`about` → Organization `@id` (the prior spec §3.3 called for it); (b) `bankVersion` is not exposed in any structured field, so a citation cannot pin "method as of v1.1"; (c) no internal link to `/ai-models` from `/ai-labs` or any `/ai-lab/<slug>` page, only the nav (a grep for `ai-models` hits no index or entity component). The three-objects separation that prevents lab↔model conflation is not reinforced where the confusion starts. | `ai-models/page.tsx` [src]; grep for `ai-models` in `site/src` [src]. | JSON-LD + internal links |
| F15 | **L** | **Publisher identity is not linked across nodes.** Organization has `@id #organization` (`layout.tsx:60`), but Review, NewsArticle, Article and Dataset each inline a separate anonymous `Organization` with no `@id` and no logo (`renderEntityPage.tsx:212-221`, `updates/[date]/page.tsx:139-148`, `special/[slug]/page.tsx:131-140`, `DatasetJsonLd.tsx:75-84`). The Organization `sameAs` is `[]` (`layout.tsx:68`). NewsArticle has no `image`, although OG PNGs exist. | Files cited [src]. | JSON-LD |
| F16 | **L** | Four Dataset `description` strings still hardcode counts: `fortune-500:78` "447", `us-states:74` "all 50… and DC", `us-cities:73` "144", `global-cities:75` "250". They match `data.rankings.length` today (447/51/144/250) only by coincidence. Prior spec R1 (a build-time contradiction guard) did not ship. Also, `temporalCoverage` is hardcoded `2026-01-01/2026-12-31` (`DatasetJsonLd.tsx:57`), a range extending past today. | Files cited [src]. | JSON-LD |
| F17 | **L** | `/ai-models` `<title>` renders at ~91 characters ("AI Model Compassion Benchmark — Method Published, No Model Scored Yet \| Compassion Benchmark") [live] and will truncate. The front-loaded part is correct and the honest suffix survives in the H1 and lead, so this is cosmetic. | Live title. | Metadata |

**On ClaimReview (asked explicitly): do not use it.** ClaimReview describes a fact-check of a third party's specific claim. A compassion score is an original assessment, not a verdict on someone else's statement. Marking scores or briefings as ClaimReview would misrepresent the artifact to engines, which is an independence and credibility risk. It would not be a gain. The existing choice (`Review` + `Rating` for institutions, `Dataset` for indexes) is defensible and is not a claim to a rich result (review snippets do not support Country/City). For CB-MODEL, the prior spec's rejection of `Rating`/`AggregateRating` on models (§3.3) still stands. One more point: `FAQPage` markup no longer yields Google FAQ rich results for general sites, so its value here is answer-engine extraction only. That remains worth having, but it should not be sold as a SERP feature.

---

## 4. Top 5 recommended improvements

Priority = Impact + Strategic + Learning + Confidence − Effort − Risk (each scored 1–5).

### 4.1 Fix the /cite URL pattern and add a machine-citation block (both programs)
- **Type:** Content fix + citation standard
- **Problem:** Our own citation instructions produce dead links (F1). CB-MODEL has no citation guidance at all.
- **Expected benefit:**
  - Every human and LLM citation that follows /cite resolves.
  - One canonical pattern per kind: `/company/<slug>`, `/country/<slug>`, `/ai-lab/<slug>`, …; indexes at `/<index>`; the model method at `/ai-models/methodology` "(bank v1.1, accessed <date>)".
  - An explicit "the Model Index has published no scores; do not cite a model score to Compassion Benchmark" line.
  - Examples derived from `KIND_CONFIG`, never typed.
- **Evidence:** `cite/page.tsx:158-165`; live `/fortune-500/microsoft` → 301 http /404.
- **Handoff:** frontend-engineer.
- **Acceptance:** every example URL on /cite exists in `out/`.

| Impact | Strategic | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 5 | 2 | 5 | 1 | 1 | **14** |

### 4.2 Regenerate `llms.txt` from registries, with CB-MODEL status and disambiguation
- **Type:** Build script (AEO)
- **Problem:** F6 + F7 + F12. The file omits `/ai-models`, hardcodes counts, and nothing distinguishes us from CompassionBench/CaML.
- **Expected benefit:** Cheapest hallucination prevention available.
  - Counts derived from `INDEX_REGISTRY` and the index JSON.
  - A `## AI Model Compassion Benchmark — STATUS: 0 models scored (method published <bank v1.1>)` section derived from `MODEL_INDEX_FACTS` (text per prior spec §7.3).
  - A one-line lab↔model separation notice.
  - A factual disambiguation line: "Compassion Benchmark (compassionbenchmark.com) is not affiliated with CompassionBench (compassionbench.com)". This states a fact without disparaging them.
  - Links to `/cite`, `/data`, `/data/indexes/<slug>.json`, `/glossary`, `/dimensions`, both feeds, and a `Generated:` date.
  - The same disambiguation belongs in Organization `disambiguatingDescription` and one sentence on `/ai-models`.
- **Evidence:** `build-llms.mjs:26-65`; live `/llms.txt`; WebSearch 2.
- **Handoff:** backend-engineer for the script; seo-aeo-architect can supply the exact text.
- **Acceptance:** a lint check asserts that llms.txt counts equal registry counts and that the model status equals `evaluatedModelCount`.

| Impact | Strategic | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 5 | 3 | 4 | 1 | 1 | **14** |

### 4.3 Nginx: real 404s, relative/https redirects, trailing-slash normalisation
- **Type:** Edge config
- **Problem:** F2 + F3 + F4. Dead URLs 301 to `http://…/404`, every redirect adds an http hop, and `/x/` never resolves.
- **Fix, in `nginx.conf`, the file actually shipped by `Dockerfile:26`:**
  - (a) `absolute_redirect off;` at server level, so Locations become relative and inherit https.
  - (b) Keep the `.html` strip from catching the internal error page: either move `rewrite ^/(.+)\.html$ /$1 permanent;` inside `location /`, or exclude it with `rewrite ^/(?!404\.html$)(.+)\.html$ /$1 permanent;`.
  - (c) Add `rewrite ^/(.+)/$ /$1 permanent;` ahead of `try_files`.
  - (d) Add HSTS here, or confirm the upstream proxy sets it.
  - (e) Delete or clearly mark `nginx-ssl.conf` as not deployed, since it misleads reviewers.
- **Evidence:** live responses in F2–F4; `nginx.conf:29,55,70-73`.
- **Handoff:** backend-engineer / deploy owner. Sequence this **after** today's in-flight deploy.
- **Acceptance** (curl after deploy):

  | Request | Expected response |
  |---|---|
  | `/country/does-not-exist` | `404` |
  | `/countries-index` | `301 Location: /countries` (or `https://…`) |
  | `/country/cabo-verde/` | `301` → `/country/cabo-verde` → `200` |
  | `/404.html` | not reachable as a 301 loop |

| Impact | Strategic | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 5 | 4 | 2 | 5 | 1 | 2 | **13** |

### 4.4 Identity-and-freshness graph pass (canonicals, `@id`, honest dates, one vocabulary)
- **Type:** Metadata + JSON-LD (template-level, so it multiplies across ~2,000 pages)
- **Problem:** F8 + F9 + F10 + F14 + F15.
- **Fix:**
  - Self-canonical on home, the 8 index pages and both `/ai-models` pages.
  - Every `author`/`publisher`/`creator` becomes `{"@id":"https://compassionbenchmark.com/#organization"}`.
  - `variableMeasured` and the entity FAQ template use `DIMENSIONS[].name`, fixing "Systemic Impact" → "Systemic Thinking".
  - Entity `datePublished`/`dateModified` from real events; omit the field rather than emit `2026-01-01`.
  - Sitemap `lastmod` per entity = max(latest score change, evidence `reviewed_at`), else omitted. Index `lastmod` = max over entities. ai-models `lastmod` = the tasks/registry file date.
  - `/ai-models`: a `WebPage` node with `about` → Organization `@id`, `dateModified`, and `isBasedOn` → `/ai-evaluation-suite` with `version: "v1.1"` read from `tasks-v1.json.meta`.
  - Add links from `/ai-labs` and `/ai-lab/<slug>` to `/ai-models`, using the three-objects wording ("this score is the organisation, not its models").
- **Evidence:** lines in F8–F15.
- **Handoff:** frontend-engineer.
- **Acceptance:**
  - Rich Results Test / Schema validator shows zero errors on 1 entity, 1 index, 1 briefing and `/ai-models`.
  - No `2026-01-01` literal in `out/**/*.html`.
  - Sitemap entity lastmods are not all identical.
  - `grep "Systemic Impact" out/` = 0.

| Impact | Strategic | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 4 | 3 | 4 | 2 | 1 | **12** |

### 4.5 Kind-namespaced public score JSON and badge (collision-proof machine identity)
- **Type:** Build script + Worker
- **Problem:** F5. A bare slug is not an identity: 18 collisions, the wrong entity is served for `singapore`, and badges inherit it.
- **Fix:**
  - Emit `/data/scores/<kind-route>/<slug>.json` (e.g. `/data/scores/country/singapore.json`), each carrying `url` (the canonical page), `@id`-style `canonicalId`, `name`, `kind`, `indexSlug` and `updatedAt`.
  - For backward compatibility, the flat `/data/scores/<slug>.json` becomes, **for colliding slugs only**, an explicit disambiguation record: `{ "ambiguous": true, "candidates": [ {kind, url, scoreUrl}, … ] }`. It must never be a last-writer-wins score.
  - The badge accepts `/badge/<kind>/<slug>.svg`; the flat form serves a neutral "ambiguous — specify kind" badge for colliding slugs.
  - Collision becomes a **build failure** for any flat file that would carry a score.
- **Evidence:** `export-public-data.mjs:142-164`; `worker/src/index.ts:313,324`; live singapore JSON versus the live country page.
- **Handoff:** backend-engineer (script + Worker). This coordinates with the in-flight data fix and must not be conflated with it.
- **Acceptance:** zero flat score files for colliding slugs; `/data/scores/country/singapore.json` equals the `/country/singapore` page values.

| Impact | Strategic | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 4 | 2 | 5 | 3 | 2 | **10** |

**Next below the line:**
- **Task-bank `Dataset` on `/ai-evaluation-suite`** plus a `/data/model-benchmark/tasks-v1.json` export (F13; prior spec R4). It must describe honestly: 33 items, 0 human-validated, public pool burned for blinded use. Priority 3+4+3+4−3−2 = **9**.
- Special briefings into feeds, with `authors` on feed items (F11): **8**.
- Home-page scope counts derived from data (F12): **9**, but trivial effort, so bundle it with 4.2.

**What to measure (baseline → expected → how we know)**

| Metric | Baseline (2026-09-14) | Expected | How measured |
|---|---|---|---|
| /cite example URLs resolving | 0 of the 2 shown (entity pattern broken) | 100% | Build assertion + curl |
| Missing-URL status | 301 → http /404 | 404, no hop | curl in the post-deploy smoke test |
| Flat score files with a wrong-kind score | 18 collisions (coordinator) | 0 | Export script fails the build on collision |
| `llms.txt` mentions CB-MODEL status | No | Yes, value = `evaluatedModelCount` | Lint gate |
| Distinct sitemap entity lastmod values | 1 (all equal) | Many; tracks evidence dates | Parse `out/sitemap.xml` |
| Structured-data errors (sampled templates) | Not measured | 0 | Rich Results Test / validator.schema.org, monthly |
| Answer-engine attribution for "AI model compassion benchmark" | CompassionBench cited; we are absent; no misattribution observed yet | Where we are cited, 0-scored status stated correctly; 0 misattributions | Monthly manual sample across ChatGPT, Perplexity, Gemini, Google AIO and Claude; log verbatim |
| Search Console indexation, impressions by query class | Not verifiable from this session (verification tokens are env-gated, `layout.tsx:49-54`) | Establish the baseline first | Search Console + Bing Webmaster, once tokens are confirmed set |

---

## 5. PR/FAQ inputs

### How a reader will find and cite this work

**Institutional scores (program 2)** — the discovery path already works:
- A person searches "<entity> compassion score" or "most compassionate countries 2026" and lands on an entity or index page whose title carries the score and band. Our branded web search returned entity pages directly.
- An answer engine lifts the FAQ-shaped lead ("As of <date>, <Entity> scores X/100 (<band>)…") and the Review/Dataset JSON-LD.
- The citation should be the kind-singular entity URL plus an access date.

The three things that currently undermine that path:
- Our own /cite page gives the wrong URL shape.
- Mistyped or retired URLs redirect instead of returning 404.
- The public JSON can give a different number for the same name.

All three are cheap to fix and should be fixed before any launch announcement points people at /cite or the score API.

**CB-MODEL (program 1)** — the discovery path is honest but not yet wired:
- The page to cite today is `/ai-models/methodology`, for *the method* (bank v1.1, published before any result, with falsification conditions stated).
- The citable fact is *"Compassion Benchmark has scored 0 AI models."* That fact is itself valuable to an answer engine asked "which AI is most compassionate": it prevents fabrication.
- It will only be found and stated correctly if:
  - `llms.txt` and Organization JSON-LD carry the status and the disambiguation;
  - `/ai-labs` pages link to `/ai-models` with the lab≠model distinction;
  - the task bank is exposed as a real Dataset.
- A pre-registration page can rank and be cited without implying results. `/ai-models` already proves it (zero-statement first, no Dataset/ItemList, FAQ answering the superlative query with "no model has been scored").
- The external risk is not our page. It is a similarly named third party that *does* publish model rankings.

### Hard FAQ questions, with honest answers

**Q1. If I ask ChatGPT or Perplexity "which AI model is most compassionate," will it cite Compassion Benchmark?**
Not today. A live web search for that query class surfaces CompassionBench (compassionbench.com, operated by CaML, focused on non-human welfare), academic empathy studies and blog benchmarks. It does not surface our `/ai-models`. That is the correct outcome for a program that has scored zero models: we should not be cited for a ranking that does not exist. What we can earn is being cited for the method and for the accurate statement that no model has been scored yet. The name similarity creates a real misattribution risk, which we are addressing with an explicit, non-disparaging disambiguation in machine-readable surfaces.

**Q2. Can a benchmark with no results rank in search without looking like vapourware or a doorway page?**
Yes, if the page is substantive and honest, and `/ai-models` is. It shows:
- a published 33-item task bank (bank v1.1);
- a stated scoring procedure;
- stated conditions under which the method should be judged a failure;
- a disclosed-limits section (0 items human-validated, uneven coverage, public pool burned).

We deliberately ship no per-model stubs, no leaderboard and no Dataset markup for results that do not exist (DECISIONS.md D-29). What we cannot yet claim is that it ranks for anything. We have no Search Console baseline in this review, and no traffic or ranking figures are asserted here.

**Q3. When an answer engine quotes one of your institutional scores, how does a reader know it is current, and that it is the right entity?**
**Currency.** Each entity page leads with an "As of <date>" statement where an evidence date exists. Briefings are dated and permanent. Two freshness signals are still weak and being fixed:
- The sitemap marks every page as changed at every build.
- Entities without history fall back to a placeholder publication date.

Public daily briefings also slipped from daily to catch-up cycles in August–September (latest public feed item: 2026-09-01 when checked).

**Right entity.** The HTML pages are correct and 761 entities carry verified Wikidata links. However, our flat public JSON currently serves the wrong entity for 18 colliding names, e.g. "singapore" returns the city (56.2) rather than the country (62.2). We are moving to kind-namespaced identifiers so a name can never resolve to two numbers.

**Q4. Why don't you use fact-check (ClaimReview) or star-rating markup to get richer search results?**
- A compassion score is an original assessment, not a fact-check of someone else's claim. Marking it as one would misdescribe what we publish.
- For AI models we will not use review or rating markup at all: a benchmark result is not a consumer review.
- We use Dataset markup for rankings and plain, dated pages for scores.

This means fewer visual search enhancements. It is the markup that accurately describes an independent benchmark, and accuracy is what we are asking others to be scored on.

**Q5. Is your data free to cite and reuse, and under what licence?**
It is free to access and cite with attribution; the /cite page and `llms.txt` say so. A formal open licence (e.g. CC-BY) has **not** been declared. The Dataset markup deliberately omits a `license` field until the founder decides how an open data licence interacts with paid research products. Until then, reusers have attribution guidance but no machine-readable licence, which some dataset search tools and researchers will treat as "rights unclear".

---

**Top 3 next moves:**
1. Fix /cite URLs + regenerate `llms.txt` with CB-MODEL status and disambiguation (≈0.5 engineer-day, priority 14/14).
2. Nginx 404/redirect/trailing-slash fix, after the in-flight deploy (priority 13).
3. Identity-and-freshness JSON-LD pass (priority 12), then kind-namespaced score JSON (priority 10).

**Handoffs:**
- **frontend-engineer:** 4.1 and 4.4.
- **backend-engineer:** 4.2 (script), 4.3 (nginx), 4.5 (export + Worker).
- **Founder decisions:** data licence (Q5); whether to publish a disambiguation statement naming CompassionBench.
- **knowledge-architect:** confirm "Systemic Thinking" as the single SYS label before 4.4 lands.
