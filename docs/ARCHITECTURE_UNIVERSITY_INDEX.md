# Architecture: University Index Integration

**Status:** Implementation-ready wiring checklist
**Author:** System Architect agent
**Date:** 2026-06-19
**Target:** Add an 8th entity index — the **University Index** (~100 universities) — to the Compassion Benchmark static-export site.

---

## 0. Decisions (lock these before any code)

| Decision | Value | Rationale |
|---|---|---|
| **Index slug** | `universities` | Matches the plural-noun convention of `countries`, `us-states`, `global-cities`. Used in update-feed JSON, analytics, `/data` paths, badge `indexSlug`. |
| **Entity `kind`** | `university` | Singular noun, matches `company`/`country`/`ai-lab`. New literal added to the `EntityKind` union. |
| **Index page route** | `/universities` | Mirrors `/ai-labs`. |
| **Entity detail route** | `/university/[slug]` | Mirrors `/ai-lab/[slug]`. |
| **Entity history route** | `/university/[slug]/history` | Mirrors `/ai-lab/[slug]/history`. |
| **Index JSON file** | `site/src/data/indexes/universities.json` | Same directory as the 7 existing indexes. |
| **University metadata fields** | `country`, `type` (required, mirrored on every row); `region`, `officialName` (optional) | No PRD-defined schema exists yet, so this spec defines the canonical shape. `country` + `type` chosen because they are the two fields that drive the cohort/filter UI (see §3). |
| **Cohort field** (peer percentile + GroupMeanBars) | `type` | `type` (e.g. "Public Research", "Private", "Liberal Arts") groups peers more meaningfully than `country` for a ~100-entity set. Confirm with product. |
| **Index-page filter field** | `country` | Mirrors `RankingTable filterKey` usage. Confirm with product whether `type` or `country` is the more useful primary filter. |

> **OPEN PRODUCT QUESTIONS (flag before locking):**
> 1. Confirm the exact university metadata fields. This spec assumes `country` + `type`. If the PRD later adds e.g. `enrollment`, `founded`, add them as optional `looseObject` fields — they flow through automatically (see §2, hazard note H0).
> 2. Confirm cohort field (`type` vs `country`) — drives peer-percentile and "closest peers" blocks on entity pages.
> 3. Confirm whether a Gumroad product exists for the University Index at launch. If not, follow the `US_CITIES_INDEX` pattern (`useGumroad:false`, route CTA through `/contact-sales?product=universities-index`).
> 4. Confirm `meta.entityCount` will equal `rankings.length` (full coverage). If partial (like us-states), a `KNOWN_PARTIAL` entry is required (§4.1).

---

## 1. Single-source-of-truth hazards (READ FIRST)

The index list is **NOT** centralized. It is duplicated across **at least 11 locations**. Every one must be touched or the new index silently breaks (missing pages, wrong counts, broken JSON-LD, 404 badges). These are the highest-risk items — a missed one produces a *silent* defect, not a build error, except where noted.

| # | Hazard location | Type of list | Build fails if missed? |
|---|---|---|---|
| H1 | `site/src/data/entities.ts` — `EntityKind` union + `KIND_CONFIG` + `ENTITIES` map + JSON import | kind enum + config + registry | **Yes** (TS exhaustiveness / type error) |
| H2 | `site/src/lib/entityHref.ts` — `KIND_TABLE` | kind→slug/route | **Yes** (TS: `Record<EntityKind,…>` must be exhaustive) |
| H3 | `site/src/app/sitemap.ts` — `ENTITY_KINDS` array + `indexPages` array | kind list + index routes | No (silent: entity URLs missing from sitemap) |
| H4 | `site/scripts/export-public-data.mjs` — `INDEX_FILES` | file→slug→kind | No (silent: no badge/score JSON for universities) |
| H5 | `site/scripts/validate-indexes.mjs` — `INDEX_SPECIFIC_FIELDS` (+ `KNOWN_PARTIAL` if partial) | per-file required fields | No (silent: weaker validation) — but build *will* fail if required fields missing and you DON'T register them, because they'd be unchecked. Add to keep integrity. |
| H6 | `site/scripts/build-llms.mjs` — `CORE_INDEXES` + the prose count "7 indexes"/"1,160+" | index list + prose | No (silent: llms.txt stale) |
| H7 | `site/src/data/entityCount.ts` — 7 hardcoded imports + sum | scored-count math | No (silent: count under-reports by ~100) |
| H8 | `site/src/components/charts/BandDistributionBar.tsx` — `INDEX_DATA` map | slug→data | No (silent: `<BandDistributionBar index="universities">` renders empty) |
| H9 | `site/src/components/entity/renderEntityPage.tsx` — `INDEX_META` + `COHORT_FIELD` + `KIND_SCHEMA_TYPE` | slug→meta, slug→cohort, kind→schema | **Partial** (TS error only on `KIND_SCHEMA_TYPE` if typed as exhaustive `Record<EntityKind,…>`; it is currently `Record<string,string>` so it is **silent** — entity page falls back to "Organization" and null cohort). |
| H10 | `site/src/app/indexes/page.tsx` — `INDEX_CARDS`, `COUNTS`, `INDEX_MEAN_ROWS`, `collectionJsonLd.itemListElement`, `numberOfItems:7` | hub grid + JSON-LD | No (silent: hub shows 7, not 8; cross-index chart omits universities) |
| H11 | `site/src/data/nav.ts` — `footerLinks.indexes` | footer nav | No (silent: no footer link) |

**Architectural recommendation (defer, do not block this index):** these 11 lists should converge on a single registry exported from `entities.ts` (e.g. `export const PUBLISHED_INDEXES = [...]` with `{ slug, kind, file, route, label, gumroad, cohortField, schemaType }`). The `.mjs` build scripts can't import the `.ts` module directly, so a companion generated `indexes.config.json` (emitted by a tiny prebuild step, or hand-maintained `.mjs` mirror) would let scripts and TS share one source. **Out of scope for this task** — but every item below marked "(SSOT hazard)" is a symptom of this debt. Adding an 8th index is the moment this pain becomes concrete; flag it to the team.

---

## 2. Data file (do this first)

### File: `site/src/data/indexes/universities.json` — **CREATE**

Mirror `ai-labs.json` exactly. Canonical shape:

```jsonc
{
  "meta": {
    "title": "Top Universities Compassion Index 2026",
    "year": 2026,
    "entityCount": 100,
    "meanScore": 0.0,          // computed from rankings; must match build-manifest mean within tolerance
    "medianScore": 0.0,        // computed from rankings
    "dimensions": ["AWR","EMP","ACT","EQU","BND","ACC","SYS","INT"]   // exactly these 8, in this order
  },
  "bands": [
    { "name": "Exemplary",   "range": "81-100", "count": 0, "pct": "0%" },
    { "name": "Established",  "range": "61-80",  "count": 0, "pct": "0%" },
    { "name": "Functional",  "range": "41-60",  "count": 0, "pct": "0%" },
    { "name": "Developing",  "range": "21-40",  "count": 0, "pct": "0%" },
    { "name": "Critical",    "range": "0-20",   "count": 0, "pct": "0%" }
  ],
  "rankings": [
    {
      "rank": 1,
      "name": "Example University",
      "country": "USA",                 // REQUIRED metadata (mirrors ai-labs "hq")
      "type": "Public Research",        // REQUIRED metadata (mirrors ai-labs "sector")
      "region": "North America",        // OPTIONAL
      "officialName": "The Example University", // OPTIONAL, display only
      "scores": {
        "AWR": 0.0, "EMP": 0.0, "ACT": 0.0, "EQU": 0.0,
        "BND": 0.0, "ACC": 0.0, "SYS": 0.0, "INT": 0.0   // each 0–5, all 8 present
      },
      "composite": 0.0,                 // 0–100, must equal computeCompositeFromDimensions(scores) within ±2.0
      "band": "exemplary"               // lowercase in source; normalized at consumers
    }
    // … 100 rows, rank contiguous 1..100, no gaps/dups
  ]
}
```

**Hard invariants enforced by `validate-indexes.mjs` (build-blocking):**
- All 8 dimension codes present in `meta.dimensions` and every `scores` object.
- Every score in `[0,5]`; composite in `[0,100]`.
- Rank contiguous `1..entityCount`, no duplicates.
- `meta.entityCount === rankings.length` (unless added to `KNOWN_PARTIAL`).
- Band counts sum to `entityCount`; band names/ranges match `VALID_BANDS`.
- `composite` within ±2.0 of the canonical formula (`scripts/lib/scoring.mjs`) — otherwise add the entity name to `ASSESSOR_OVERRIDE_NAMES` *only* with a documented rationale.

> **Hazard H0 (metadata flow-through):** `schema.ts` uses `z.looseObject` for ranking rows, so `country`/`type`/`region`/`officialName` flow through `entities.ts → entity.metadata` automatically **without** any schema edit. Do **not** add university-specific fields to `RankingEntrySchema`. The only required `validate-indexes.mjs` registration is the per-file `INDEX_SPECIFIC_FIELDS` entry (§4.1).

---

## 3. Routes (3 new files + 1 directory rename note)

### File: `site/src/app/universities/page.tsx` — **CREATE**
Mirror `site/src/app/ai-labs/page.tsx` line-for-line, substituting:
- `import data from "@/data/indexes/universities.json"`
- `metadata.title`: `"Most & Least Compassionate Universities 2026 — Compassion Benchmark"`
- `metadata.description`: superlative, answer-first, with real entity count.
- `columns`: replace `{key:"sector"}`/`{key:"hq"}` with `{key:"type",label:"Type"}` and `{key:"country",label:"Country"}`.
- `IndexHero` eyebrow/title/description; stats array (Labs ranked → "Universities ranked").
- `DatasetJsonLd`: `url="/universities"`, `indexSlug="universities"`, keywords.
- `BreadcrumbJsonLd`: `{ name: "Universities Index", url: breadcrumbUrl("/universities") }`.
- `IndexPageCharts`: `indexSlug="universities"`, `groupKey="type"`, `groupLabel="Type"`, `indexName="Universities"`, `indexPagePath="/universities"`.
- `RankingTable`: `filterKey="country"` (or `type` — see §0 Q1), `entityKind="university"`, CTA copy + `ctaLink`.
- `CrawlableRankingTable`: `nameLabel="University"`.
- FAQ items: "What is the most/least compassionate university in 2026?", "How many universities are scored?".
- CTA buttons: `GUMROAD.universitiesIndex` (add in §4.6) or `/contact-sales?product=universities-index` if no product yet.

### File: `site/src/app/university/[slug]/page.tsx` — **CREATE**
Exact copy of `ai-lab/[slug]/page.tsx`, substituting `"ai-lab"` → `"university"`:
```ts
import { makeEntityPage, makeGenerateMetadata, makeGenerateStaticParams } from "@/components/entity/renderEntityPage";
export const generateStaticParams = makeGenerateStaticParams("university");
export const generateMetadata = makeGenerateMetadata("university");
export default makeEntityPage("university");
```
`generateStaticParams` resolves to `getAllSlugs("university")`; slug→entity via `getEntityBySlug("university", slug)`. **No per-route logic** — all behavior is driven by `KIND_CONFIG["university"]` (§4.2). This works only after H1, H9 are done.

### File: `site/src/app/university/[slug]/history/page.tsx` — **CREATE**
Exact copy of `ai-lab/[slug]/history/page.tsx`, substituting `"ai-lab"` → `"university"` and `"/ai-lab"` → `"/university"`:
```ts
import { makeHistoryGenerateStaticParams, makeHistoryGenerateMetadata, makeHistoryPage } from "@/components/entity/renderHistoryPage";
export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("university");
export const generateMetadata = makeHistoryGenerateMetadata("university", "/university");
export default makeHistoryPage("university", "/university");
```

> History pages are only generated for slugs with ≥1 event in the entity-history manifest, so at launch (no briefing history yet) this route renders zero pages — that is correct and harmless.

---

## 4. Index registration (the SSOT-hazard surface)

### 4.1 File: `site/scripts/validate-indexes.mjs` — **EDIT** (H5)
Add to `INDEX_SPECIFIC_FIELDS`:
```js
"universities.json": ["country", "type"],
```
If coverage is partial (entityCount ≠ 100 rows), also add a `KNOWN_PARTIAL` entry mirroring `us-states.json`. (Default assumption: full coverage, no entry needed.)
*Why:* enforces that every row carries the required metadata; without this the new fields are unvalidated.

### 4.2 File: `site/src/data/entities.ts` — **EDIT** (H1, build-blocking)
Four changes:
1. Add import: `import universities from "./indexes/universities.json";`
2. Add `"university"` to the `EntityKind` union.
3. Add `KIND_CONFIG.university`:
```ts
university: {
  kind: "university",
  label: "university",
  labelPlural: "universities",
  route: "university",
  indexLabel: "Universities Index",
  indexSlug: "universities",
  indexRoute: "/universities",
  gumroadUrl: GUMROAD.universitiesIndex,   // add in §4.6
  gumroadPrice: "$195",
  metadataFields: ["country", "type"],
},
```
4. Add to the `ENTITIES` map:
```ts
university: buildEntities("university", parseIndex("universities", universities)),
```
*Why:* this is the registry root. `getAllEntities`/`getEntityBySlug`/`getAllSlugs`/`kindFromIndexSlug` all derive from here. `buildEntities` + `extractMetadata` are index-agnostic — `country`/`type`/`region`/`officialName` are auto-extracted into `entity.metadata`. No edit to `buildEntities` needed.

### 4.3 File: `site/src/lib/entityHref.ts` — **EDIT** (H2, build-blocking)
Add to `KIND_TABLE`:
```ts
university: { indexSlug: "universities", routePrefix: "university" },
```
*Why:* `Record<EntityKind, …>` is exhaustive — TS fails to compile without it. Derives `INDEX_ROUTE_PREFIX`, `entityHref`, `resolveSlugHref` (cross-index slug links from briefings), `ALL_ENTITY_KINDS`. No other edit needed; all helpers iterate `KIND_TABLE`.

### 4.4 File: `site/src/data/schema.ts` — **NO CHANGE** (confirmed)
`RankingEntrySchema`/`IndexMetaSchema` are `looseObject`. University metadata flows through. The 8-dimension `DimensionScoresSchema` already matches. **Do not add an index-specific field.** (Documented here so an implementer doesn't "helpfully" edit it.)

### 4.5 File: `site/src/app/indexes/page.tsx` — **EDIT** (H10)
This hub hardcodes "7" in ~5 places. Changes:
1. Add import: `import universitiesData from "@/data/indexes/universities.json";`
2. `COUNTS`: add `universities: universitiesData.rankings.length,`
3. `INDEX_MEAN_ROWS`: add `{ name: "Universities", composite: universitiesData.meta.meanScore, group: "Universities" }` (OVERALL_MEAN recomputes automatically).
4. `INDEX_CARDS`: add a card `{ href:"/universities", slug:"universities", pills:["2026","Education"], title:"Universities Index", count:COUNTS.universities, differentiator:"Mean score … — <honest finding from real data>" }`. **Differentiator must be traced to real data, never fabricated.**
5. `collectionJsonLd`: bump `numberOfItems: 7 → 8`; add `{ "@type":"ListItem", position:8, name:\`Universities Index (${COUNTS.universities} entities)\`, url:\`${SITE}/universities\` }`.
6. Prose/FAQ strings that say "7 indexes" / "Seven index families" → "8 indexes" / "Eight index families". Grep this file for `7` and `Seven`. The `Stat value="7"` ("Published index families") → `"8"`.
*Why:* hub is the canonical discovery surface + CollectionPage JSON-LD; silent under-count otherwise.

### 4.6 File: `site/src/data/gumroad.ts` — **EDIT**
Add `universitiesIndex` URL. If no product yet, follow the `US_CITIES_INDEX` pattern:
```ts
universitiesIndex: "https://compassionbenchmark.gumroad.com/l/TODO-universities",
```
plus an optional `UNIVERSITIES_INDEX = { useGumroad:false, priceLabel:"$195", productName:"Universities Index" } as const;`
*Why:* `KIND_CONFIG.university.gumroadUrl` references it; centralizes the link.

### 4.7 File: `site/src/data/nav.ts` — **EDIT** (H11)
Add to `footerLinks.indexes`:
```ts
{ label: "Universities", href: "/universities" },
```
*Why:* footer index discovery. (Top `mainNav` points at `/indexes` hub — no change there.)

---

## 5. Build & validation scripts + pipeline rotation

### 5.1 File: `site/scripts/export-public-data.mjs` — **EDIT** (H4)
Add to `INDEX_FILES`:
```js
{ file: "universities.json", indexSlug: "universities", kind: "university" },
```
*Why:* generates `public/data/scores/<slug>.json` (Worker badge endpoint), `public/data/indexes/universities.json` (Dataset DataDownload), and adds universities to `public/data/index.json` catalog. The catalog feeds `build-entity-history.mjs` and `/data`. Slug-disambiguation logic mirrors `entities.ts` — no other change.

### 5.2 File: `site/scripts/build-manifest.mjs` — **NO CHANGE** (confirmed)
`summarizeIndex` runs over `readdirSync(INDEXES_DIR)` — it auto-discovers `universities.json`. The new index appears in `build-manifest.json` indexes[], `totalEntities`, `totalFloorDesignations` automatically. (Verify mean/median in the manifest match `meta` after creating the JSON.)

### 5.3 File: `site/scripts/build-entity-history.mjs` — **NO CHANGE** (confirmed)
Reads the entity catalog (`public/data/index.json`) + daily briefings. Universities flow in via §5.1 catalog. No per-index list. History files appear once briefings reference university slugs.

### 5.4 File: `site/scripts/build-llms.mjs` — **EDIT** (H6)
Add to `CORE_INDEXES`:
```js
{ label: "Universities Index 2026", url: `${BASE_URL}/universities` },
```
Update the prose `>` block: "7 indexes" → "8 indexes", add "universities" to the parenthetical list, and the "1,160+" / entity-count number (regenerate after data lands). `public/llms.txt` is the generated output — do not hand-edit it; rerun the script.
*Why:* AI-crawler orientation; keeps llms.txt from drifting.

### 5.5 File: `site/scripts/build-search-index.mjs` — **NO CHANGE** (confirmed)
Pagefind indexes rendered HTML in `out/`. Once the `/universities` + `/university/[slug]` pages exist, they're auto-indexed. `EXCLUDED_PAGE_NAMES` does not list ranking pages (they're intentionally included). No edit.

### 5.6 File: `site/src/app/sitemap.ts` — **EDIT** (H3)
Two changes:
1. `ENTITY_KINDS` array: add `"university"`.
2. `indexPages` array: add `"/universities"`.
*Why:* `ENTITY_KINDS` is a local hand-maintained array (NOT derived from `ALL_ENTITY_KINDS` — a latent SSOT bug; consider replacing with `ALL_ENTITY_KINDS` from `entityHref.ts` in the same PR). Without (1), no university entity/history URLs in sitemap; without (2), the index page is missing.

### 5.7 File: `research/rotation-state.json` — **EDIT (data seeding, ~100 entries)**
The nightly scan pipeline reads/writes this rotation ledger keyed by slug. Each university needs an entry:
```jsonc
"example-university": {
  "name": "Example University",
  "index": "universities",
  "rank": 1,
  "composite": 0.0,
  "band": "exemplary",
  "last_scanned": "",
  "last_assessed": "",
  "last_change_proposal": "",
  "last_evidence_touch": ""
}
```
Also bump top-level `entity_count` by the number added. **Generate this programmatically** from `universities.json` (slug via the shared slugify) rather than by hand — a one-off seeding script that reads the index JSON and appends entries with empty scan dates so the pipeline picks them up on its next rotation. Slugs MUST match `export-public-data.mjs`/`entities.ts` output exactly, or badges and pipeline diverge.
*Why:* without rotation entries the 100 universities are never scanned/assessed by the nightly pipeline — they'd be static forever.

---

## 6. SEO / meta / OG

### 6.1 Index + entity page JSON-LD — covered by §3 (page files)
- `/universities`: `DatasetJsonLd` (slug `universities`), `BreadcrumbJsonLd`, `FaqJsonLd` + visible `FaqAccordion` (superlative most/least Qs from real data).
- `/university/[slug]`: `Review` JSON-LD + `BreadcrumbList` + `FaqPage` are emitted by `renderEntityPage.tsx` automatically once `KIND_SCHEMA_TYPE` is set (§6.2).

### 6.2 File: `site/src/components/entity/renderEntityPage.tsx` — **EDIT** (H9)
Three maps need a `universities`/`university` entry:
1. Add import `import universities from "@/data/indexes/universities.json";`
2. `INDEX_META`: add `"universities": universities.meta as IndexMetaSlim,` — drives hero band-position strip + median + distribution.
3. `COHORT_FIELD`: add `"universities": "type",` — drives peer-percentile, "closest peers", GroupMeanBars cohort. (Use `type` per §0; without this, cohort blocks silently don't render.)
4. `KIND_SCHEMA_TYPE`: add `"university": "EducationalOrganization",` — correct schema.org type for the `Review.itemReviewed`. Without it, falls back to "Organization" (semantically weaker, not broken). **Use `CollegeOrUniversity` if you want the most specific type.**
*Why:* these three maps are keyed by slug/kind and are NOT exhaustive-typed, so a miss is **silent** (degraded entity page, generic schema), not a build error — the most dangerous category.

### 6.3 Sitemap — covered in §5.6.
### 6.4 llms.txt — covered in §5.4.

### 6.5 OG images — **NO SCRIPT CHANGE** (confirmed); optional static cards
`build-og-images.mjs` only generates cards for **special briefings** and **daily briefings**, not for index/entity pages. Index and entity pages currently rely on Next.js default `openGraph` metadata (set in `generateMetadata`), not a per-page PNG. So **no OG generation change is required** for the University Index.
- If product wants a dedicated `/universities` OG PNG to match the site's design, that is a **net-new feature** (the script has no index-card renderer today) — out of scope; flag as optional follow-up.

---

## 7. Index-agnostic components (confirmed — NO per-index change)

These are driven by the canonical 8 dimensions (`dimensions.ts` / `schema.ts DIMENSION_CODES`) or by `KIND_CONFIG`, so they need **zero** edits:

| Component | Why agnostic |
|---|---|
| `DimensionLegend` / `ScoreLegend` | Renders the fixed 8 dimensions + 5 bands. Index-independent. |
| `RankingTable` | Generic: takes `columns`, `data`, `filterKey`, `entityKind` as props. New columns are supplied by `/universities/page.tsx`. |
| `EntityDetail` | Pure presentational; consumes the `Entity` shape + computed props from `renderEntityPage`. |
| `renderHistoryPage` | Parameterized by `kind` + route; no index list. |
| `IndexPageCharts`, `GroupMeanBars`, `BandDistributionBar` (as a *component*) | Accept `rankings`/`groupKey` props. **Exception:** `BandDistributionBar`'s `index="<slug>"` lookup map (`INDEX_DATA`) IS hardcoded — see §8. |
| `EntitySearch` / `NavbarSearch` | Driven by the generated search/catalog data + Pagefind over rendered HTML. Auto-includes universities. |
| `entityChanges.ts`, `evidence-reviews`, `history.ts` | Keyed by `(indexSlug, slug)`; resolve dynamically. |

---

## 8. Remaining count/aggregate SSOT edits

### 8.1 File: `site/src/data/entityCount.ts` — **EDIT** (H7)
Add `import universitiesData from "@/data/indexes/universities.json";` and add `(universitiesData as {rankings:unknown[]}).rankings.length,` to the `SCORED_ENTITY_COUNT` sum array.
*Why:* `SCORED_ENTITY_COUNT_FORMATTED` is shown across the hub, methodology, and meta descriptions. Silent under-count by ~100 otherwise.

### 8.2 File: `site/src/components/charts/BandDistributionBar.tsx` — **EDIT** (H8)
Add `import universitiesData …` and add `"universities": universitiesData as {rankings:Array<{band?:string}>},` to the `INDEX_DATA` map.
*Why:* the hub's `<BandDistributionBar index="universities" compact />` (added in §4.5) renders empty without this. The `index="all"` aggregate path also under-counts until added.

---

## 9. Ordered implementation sequence (do in this order)

1. **`universities.json`** (§2) — nothing else compiles meaningfully without data. Run `npm run validate` to confirm.
2. **`validate-indexes.mjs`** `INDEX_SPECIFIC_FIELDS` (§4.1) — lock data integrity early.
3. **`gumroad.ts`** (§4.6) — `KIND_CONFIG` references it; do before entities.ts.
4. **`entities.ts`** (§4.2) + **`entityHref.ts`** (§4.3) — the two build-blocking type edits. Project should typecheck after this.
5. **Route files** (§3): `/universities/page.tsx`, `/university/[slug]/page.tsx`, `/university/[slug]/history/page.tsx`.
6. **`renderEntityPage.tsx`** (§6.2) — entity pages render correctly (schema type + cohort + meta).
7. **`indexes/page.tsx`** (§4.5), **`nav.ts`** (§4.7) — hub + footer discovery; 7→8 count fixes.
8. **`entityCount.ts`** (§8.1), **`BandDistributionBar.tsx`** (§8.2) — count/aggregate correctness.
9. **`export-public-data.mjs`** (§5.1), **`sitemap.ts`** (§5.6), **`build-llms.mjs`** (§5.4) — build-script registration.
10. **`research/rotation-state.json`** (§5.7) — pipeline seeding (programmatic).
11. **Full build** `npm run build` — confirms: validate-indexes passes, static export renders 100 entity pages + index page, `build-manifest.json` shows 8 indexes, `public/data/index.json` + scores include universities, sitemap + llms.txt updated. Grep `out/` and `build-manifest.json` to verify count = previous + 100.

---

## 10. Files-changed ledger

**CREATE (4):**
1. `site/src/data/indexes/universities.json`
2. `site/src/app/universities/page.tsx`
3. `site/src/app/university/[slug]/page.tsx`
4. `site/src/app/university/[slug]/history/page.tsx`

**EDIT (12):**
5. `site/src/data/entities.ts`
6. `site/src/lib/entityHref.ts`
7. `site/src/app/indexes/page.tsx`
8. `site/src/data/nav.ts`
9. `site/src/data/gumroad.ts`
10. `site/src/data/entityCount.ts`
11. `site/src/components/charts/BandDistributionBar.tsx`
12. `site/src/components/entity/renderEntityPage.tsx`
13. `site/scripts/validate-indexes.mjs`
14. `site/scripts/export-public-data.mjs`
15. `site/scripts/build-llms.mjs`
16. `site/src/app/sitemap.ts`

**EDIT (data seeding, 1):**
17. `research/rotation-state.json` (programmatic, ~100 entries + count)

**CONFIRMED NO-CHANGE (7):** `schema.ts`, `build-manifest.mjs`, `build-entity-history.mjs`, `build-search-index.mjs`, `build-og-images.mjs`, `dimensions.ts`, and all index-agnostic display components (`RankingTable`, `EntityDetail`, `ScoreLegend`/`DimensionLegend`, `IndexPageCharts`, `renderHistoryPage`, `EntitySearch`).

**Total files to change: 17** (4 create + 13 edit, of which 1 is bulk data seeding).

---

## 11. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Missed silent-SSOT edit (H3,H4,H6,H7,H8,H9,H10,H11) → no build error, wrong/missing output | High | Use §10 ledger as a literal checklist; verify post-build via `build-manifest.json` (8 indexes) + grep `out/` for `/university/` pages + open `/indexes`. |
| Slug divergence between `entities.ts`, `export-public-data.mjs`, and `rotation-state.json` → broken badges + orphaned pipeline entries | High | All three use the same kebab-case slugify; generate rotation-state from the index JSON, never hand-author slugs. |
| `composite` not matching formula → validate-indexes build failure | Med | Compute composites with `scripts/lib/scoring.mjs`; only override with documented `ASSESSOR_OVERRIDE_NAMES` rationale. |
| Cohort field choice (`type` vs `country`) wrong → weak peer blocks | Low | Product confirm (§0 Q2); single-line change in `COHORT_FIELD`. |
| No Gumroad product at launch | Low | `US_CITIES_INDEX` fallback pattern (`useGumroad:false` → `/contact-sales`). |
| Index-list SSOT debt compounds with each new index | Med (systemic) | Recommend consolidating the 11 lists into one `PUBLISHED_INDEXES` registry as a follow-up; out of scope here. |
