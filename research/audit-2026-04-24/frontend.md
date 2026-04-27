# Frontend Audit — 2026-04-24

## Next.js 16 Doc Verification

Docs read before forming opinions:
- `site/node_modules/next/dist/docs/index.md` — top-level orientation
- `site/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` — confirmed `params: Promise<{...}>` is the required signature
- `site/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` — confirmed async `generateMetadata` with `params: Promise<{...}>` is current

The docs confirm the app is on a React 19 + Next.js 16 build. Key breaking change from prior major versions: `params` and `searchParams` props are now **Promises**, not plain objects; page components must `await params`. The repo uses this pattern correctly throughout.

---

## Top 3 Critical Findings

1. **Untyped daily JSON propagates `any` through the entire updates pipeline** — `DailyBriefing.tsx:18` disables `no-explicit-any` wholesale; `updates/[date]/page.tsx:47` casts to `any`; `updates/page.tsx:7` same. A JSON key rename in the overnight digest will produce a runtime `undefined` instead of a type error. This was the root cause of the 2026-04-21 incident and the risk remains fully alive.

2. **`<>` fragment missing `key` in RankingTable tbody loop** — `RankingTable.tsx:203` wraps the `<tr>` + optional CTA `<tr>` in an anonymous `<>` fragment with no `key` prop. The `key` is on the inner `<tr>` (line 204: `key={entry.rank}`) but React requires it on the outermost node returned from `.map()`. This triggers a React reconciliation warning in dev and can cause visual flicker or incorrect DOM diffing when rows reorder (sort/filter). For a table with hundreds of rows this is a silent correctness bug.

3. **`Button` is `"use client"` solely for analytics — forces every tree that imports it to be a client subtree** — `Button.tsx:1`. The `onClick` analytics handler is needed only on external links. Internal `<Link>` and plain `<button>` usages of `Button` carry no client logic yet force their parent server components to adopt client boundaries. Any index page that imports `Button` via a server component now ships the analytics library to the client for every visitor, even those who never interact with a Gumroad link.

---

## Detailed Findings

### 1. Next.js 16 Compliance

**Pattern check against documented API:**

| Pattern | Expected (docs) | Found in repo | Status |
|---|---|---|---|
| `params` type | `Promise<{ slug: string }>` | Used in all dynamic routes | Correct |
| `generateStaticParams` return | `Array<{ slug: string }>` (sync or async) | Correct — `renderEntityPage.tsx:22`, `updates/[date]/page.tsx:12` | Correct |
| `generateMetadata` signature | `async ({ params }: { params: Promise<...> })` | Correct — `renderEntityPage.tsx:27` | Correct |
| Metadata API | `export const metadata` or `generateMetadata` | Both used appropriately | Correct |
| `"use client"` directive | Placed at file top, before imports | Correctly placed in all 9 client components | Correct |

No deprecated APIs detected. The `params: Promise<{...}>` breaking change (introduced in Next.js 15, solidified in 16) is handled correctly site-wide. The `await params` pattern is present in every dynamic route.

**One non-blocking note:** `site/AGENTS.md` states "read the relevant guide in `node_modules/next/dist/docs/`" — the docs index hints at `unstable_instant` for instant navigation. The site does not export `unstable_instant` from any route, but given the static export target this is not a concern.

### 2. Prerender Safety

**`/updates/[date]/page.tsx` analysis:**

- Lines 37–44: manifest check + `getDailyData` null check both fire `notFound()` — good guard against unknown dates.
- Line 47: `const u = updates as any;` — all field access below is unguarded. Lines 67–79 access `u.date`, `u.generatedAt`, `u.pipeline?.proposalsGenerated`, etc. The optional chaining on `pipeline` fields is a partial mitigation but does not cover top-level key renames (e.g. if `date` became `briefingDate`, line 67 silently injects `undefined` into schema.org JSON-LD with no build error).
- `getDailyData` in `site/src/data/updates/daily/index.ts:5` wraps the dynamic import in try/catch and returns `unknown | null`. The `unknown` return type is immediately cast to `any` by the caller — the safety of `unknown` is discarded at the boundary.

**`DailyBriefing.tsx` — strongest mitigation in the codebase:**

Lines 131–141 destructure all array fields with `= []` defaults, and lines 150–157 normalize the `sectorTrends` shape across two known schema variants. This is the correct pattern and directly addresses the 2026-04-21 crash. However, it only covers array fields and one known shape variant. Scalar field access (e.g. `pipeline.entitiesScanned`) uses optional chaining without defaults on the type — a renamed key produces `NaN` or `undefined` in the rendered output, not a crash, but it is a silent data integrity failure.

**Other at-risk routes:**

- `site/src/app/updates/page.tsx:7` — `const updates = updatesRaw as any` imports `latest.json` statically. If the nightly pipeline renames a top-level key in `latest.json`, the JSON-LD block at lines 34–48 silently emits `undefined` values. Not a prerender crash but a structured data regression invisible at build time.
- `site/src/app/page.tsx:15` — same pattern for the homepage using `latest.json`.
- `entityChanges.ts:43` — casts dynamic import result to `DailyUpdate | null`. `DailyUpdate` is a local interface (line 30) with `scoreChanges?: ScoreChangeRecord[]` — this is typed correctly and the `Array.isArray` guard at line 44 is safe.

**Recommendation:** Define a `DailyBriefingData` interface in a shared `types.ts` and use it as the return type of `getDailyData`. Replace the `as any` cast in `[date]/page.tsx` with the typed interface. The `DailyBriefing` component props should accept the typed interface rather than `any`. This closes the schema-drift crash surface permanently without changing runtime behavior.

### 3. TypeScript Discipline

- `tsconfig.json:7` — `"strict": true` is set. Good.
- Shared types exist but are fragmented:
  - `RankingEntry` is defined in `components/index/RankingTable.tsx:23` and re-exported from there. `CrawlableRankingTable.tsx:1` imports it from the component file — a leaky coupling between a UI component and a data type.
  - `DailyUpdate` interface lives in `data/updates/entityChanges.ts:30` — local only, not shared with the pages or `DailyBriefing`.
  - `Entity` and `EntityKind` are well-defined in `data/entities.ts:25,34` — the strongest typing in the codebase.
  - No shared `types.ts` or `types/` directory. There is no `DailyBriefingData` type that covers the full JSON schema used across three pages + one large component.
- `DailyBriefing.tsx`, `updates/page.tsx`, `updates/[date]/page.tsx`, and `app/page.tsx` all suppress `no-explicit-any`. Combined, this represents roughly 200 lines of the highest-traffic rendering paths operating with no type safety on the data shape most likely to drift.
- `Band.tsx` exports `BandLevel` as a typed union — this is used correctly throughout.
- `IndexHero.tsx` and `RankingTable.tsx` are well-typed locally.

### 4. Component Quality (Spot-checks)

**RankingTable (`components/index/RankingTable.tsx`)**

- Accessibility gaps:
  - `<input>` at line 156 has no `<label>` and no `aria-label`. Screen readers announce it as an unlabeled edit field.
  - `<select>` elements at lines 163 and 176 have no `<label>` associations. The `filterLabel` and sort options are visually implied but not accessible.
  - `<table>` has no `<caption>` or `aria-label`.
  - The search and sort controls are not grouped in a `<fieldset>` or `role="search"`.
- Correctness bug: `<>` fragment at line 202 is the map return root but carries no `key`. The `key` is on the inner `<tr>` at line 204. React will emit a warning and may reorder DOM incorrectly on filter/sort transitions.
- Performance: `useMemo` for filtering/sorting is correct. The `filterOptions` derivation at line 82 runs `new Set` over the full data array — acceptable for current sizes (≤447 rows).
- Typing: `RankingEntry` at line 23 uses `[key: string]: unknown` as an index signature. This is sound for the dynamic column access pattern.

**IndexHero (`components/index/IndexHero.tsx`)**

- Pure server component (no `"use client"`), correctly so — no state or event handlers.
- Well-typed via local interfaces (`BandInfo`, `StatInfo`, `Props`).
- The inner `<table>` (band distribution) at lines 61–95 duplicates the `<th>` styling from `RankingTable` with identical Tailwind classes. This is component duplication (see Finding 5).
- No accessibility issues with the table itself — `<th>` elements are in `<thead>`.
- No ARIA issues. Decorative content only.

**ResearchConfigurator (`components/purchase/ResearchConfigurator.tsx`)**

- `"use client"` is justified — four controlled `<select>` elements drive a purchase configurator.
- `<label>` elements at lines 113, 126, 139, 153 are present but not associated to their `<select>` via `htmlFor`/`id`. A screen reader will not announce the label when focus is on the select.
- `resolveCheckout` function is pure and well-typed with an explicit return type at line 66.
- The hardcoded price string `"$195"` at line 76 will be incorrect if pricing changes — it is not driven by any data source. Same for `"2026"` as the default year at line 91.
- `useMemo` at line 96 correctly memoizes the summary derivation.
- `areaMap`, `formatMap`, `licenseMap`, `gumroadMap` are module-level constants — appropriate.

### 5. Component Duplication

**Table header styling** is duplicated across:
- `RankingTable.tsx:194` — `th` class: `"text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line whitespace-nowrap"`
- `IndexHero.tsx:64–73` — four `<th>` elements with `"text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line"` (identical except missing `whitespace-nowrap`)

These are identical except one token. A `<TableHeader>` primitive would eliminate both.

**Band distribution table** appears to be a bespoke inline implementation inside `IndexHero`. There is also `CrawlableRankingTable` in `components/seo/CrawlableRankingTable.tsx` — a third table implementation for SEO. Three table renderers exist with no shared base.

**Newsletter signup** has three inline variant shapes within a single file (`NewsletterSignup.tsx`) at lines 150, 207, and 252 — three `aria-label="Email address for newsletter"` inputs. This suggests inline variant switching inside one component rather than composition, adding cognitive overhead.

**Entity card** concept does not appear duplicated — `EntityDetail` is the single entity renderer, consistently used via `makeEntityPage`.

### 6. Client-Side Code

Client components found (`"use client"`):
1. `components/assessment/SelfAssessment.tsx` — stateful multi-step assessment; justified.
2. `components/index/EntitySearch.tsx` — search input with state; justified.
3. `components/index/RankingTable.tsx` — search, filter, sort state; justified.
4. `components/layout/Navbar.tsx` — mobile menu open/close, dropdown outside-click detection; justified.
5. `components/purchase/ResearchConfigurator.tsx` — four controlled selects; justified.
6. `components/purchase/SalesInquiryForm.tsx` — form state; justified.
7. `components/ui/Button.tsx` — analytics click handler; **partially unjustified** (see Finding 3 above).
8. `components/ui/NewsletterSignup.tsx` — email input + submission state; justified.
9. `components/updates/TrackedEntityLink.tsx` — Umami analytics on click; the link itself could be a server component if the tracker were a thin wrapper.

`Button` is the highest-leverage fix: splitting it into a server component `ButtonLink` (for internal links, no JS) and a client component `ExternalButton` (for external Gumroad links with analytics) would remove `Button` from the client bundle on all index pages.

The site has no `<img>` tags and no images to optimize. No `next/font` usage — fonts load via `font-family` system stack in `globals.css:27`. For a text-heavy benchmark site the system font stack is a valid and fast choice; no blocking custom font requests.

The Umami analytics script in `layout.tsx:62–67` uses `defer` — non-blocking. No other blocking scripts detected.

### 7. Performance

- **Images:** No images in the codebase. `next/image` is unused — not a gap given there are no images to optimize.
- **Fonts:** System stack via CSS in `globals.css:27`. No web font downloads. Fast.
- **Scripts:** One deferred Umami script in `layout.tsx`. No blocking scripts.
- **Bundle:** The dominant client JS comes from `RankingTable` (largest client component, renders tables of up to 447 rows), `Navbar` (dropdown logic), and `DailyBriefing` (large render tree, fully `"use client"`-free — it is a server component despite its size). Entity detail pages add `EntityDetail` as a server component.
- **Static export:** `next.config.ts` has `output: 'export'`. All pages are statically generated. There is no runtime Node.js server; JS only executes in browser.
- **Largest route:** `/fortune-500` and `/updates/[date]` pages are the largest by data volume. Fortune 500 passes 447 entities as a JSON prop to `RankingTable`, which ships the full dataset to the client as inline `<script>` data. This is acceptable for current sizes but will grow with entity count.

### 8. Today's Entity Rendering

Entities applied in commit c73cb52 and their expected routes:

| Entity | Index | Slug (derived) | Route | Present in JSON? | Slug collision? |
|---|---|---|---|---|---|
| Becton Dickinson | fortune-500 | `becton-dickinson` | `/company/becton-dickinson` | Yes (rank 82, score 54.1) | No |
| Luxembourg | countries | `luxembourg` | `/country/luxembourg` | Yes (rank 15) | No |
| Iceland | countries | `iceland` | `/country/iceland` | Yes | No |
| Vermont | us-states | `vermont` | `/us-state/vermont` | Yes (score 87.5) | No |
| Minnesota | us-states | `minnesota` | `/us-state/minnesota` | Yes (score 84.4) | No |
| Hugging Face | ai-labs | `hugging-face` | `/ai-lab/hugging-face` | Yes | No |

All six entities are present in their respective index JSON files. Slugs are generated by `slugify()` at build time from entity names — no hardcoded slugs in the JSON. All slugs match the pipeline convention. Routes exist (`[slug]` under each kind directory).

**Hardcoded rank references:** No hardcoded "The #1 state is Vermont" or equivalent string found anywhere in `src/app/` or `src/components/`. Page metadata is generated dynamically from `entity.rank` and `entity.composite` in `renderEntityPage.tsx:38`. Index pages do not reference specific entity names in their static copy.

Vermont and Minnesota scores updated correctly (87.5 and 84.4 respectively), both remaining in `exemplary` band. The daily briefing for 2026-04-24 (`latest.json`) references Vermont rank 1 and the ceiling artifact only within the `scoreChanges[].headline` and `sectorAlerts[].alert` strings — this is factual research content, not a presentational hardcoded rank claim, and is correct for the archived briefing.

---

## Quick-Win Backlog

1. **Fix `<>` key prop in `RankingTable.tsx:202`** — wrap the fragment in `<Fragment key={entry.rank}>` or use `<React.Fragment key={...}>`. One-line fix that eliminates a React reconciliation bug visible on sort/filter with hundreds of rows.

2. **Add `aria-label` to `RankingTable` search input and associate `<label>` to selects in `ResearchConfigurator`** — four missing label associations across two high-traffic components. Fixes screen reader announce for the search field and all four configurator selects. < 1 hour.

3. **Add `htmlFor`/`id` pairs to `ResearchConfigurator` selects** — the four `<label>` elements at lines 113, 126, 139, 153 are visually correct but not programmatically associated. Add matching `id` to each `<select>` and `htmlFor` to each `<label>`. < 30 minutes.

4. **Extract `RankingEntry` and `ColumnDef` types to `src/data/types.ts`** — currently defined inside the UI component. `CrawlableRankingTable` imports types from a component file — wrong direction of dependency. Moving types to `src/data/types.ts` is a zero-runtime-impact refactor that correctly separates data shapes from UI code. < 2 hours.

5. **Split `Button` into a server component path and a client component path** — the analytics handler is only needed on external links. A server `<a>` for external links without tracking, and a thin client wrapper only for Gumroad links, removes `Button` from the client bundle on every non-interactive page. Estimated impact: removes the analytics import from ~15 server component trees. < 4 hours.

---

## Strategic Backlog

1. **Define and enforce `DailyBriefingData` typed schema across the entire updates pipeline** — create a shared `DailyBriefingData` interface covering all fields emitted by the overnight digest (`date`, `generatedAt`, `pipeline`, `scoreChanges`, `confirmations`, `sectorTrends`, `emergingRisks`, `insights`, `highlights`, `recentAssessments`, `sectorAlerts`). Use it as the return type of `getDailyData`, the prop type of `DailyBriefing`, and in both updates pages. Audit all field accesses against the type. This permanently closes the schema-drift crash surface that caused the 2026-04-21 incident. Estimated effort: 1–2 days including back-testing against all 10 existing daily JSON files.

2. **Consolidate table rendering into a shared primitive** — three independent table implementations exist (`RankingTable`, `IndexHero` inline table, `CrawlableRankingTable`). A composable `<DataTable columns={...} rows={...}>` server component with an optional `caption`, `aria-label`, and shared `<th>` styling would eliminate duplication, make accessibility fixes apply everywhere at once, and reduce the maintenance surface for future index additions. Estimated effort: 1 week including migration and QA of all seven index pages.

3. **Introduce a build-time schema validation step for all daily JSON files** — add a `scripts/validate-daily.mjs` (or extend the existing `validate-indexes.mjs`) that validates every file in `data/updates/daily/` against a JSON Schema or zod schema before `next build` runs. This catches key renames, missing required fields, and type mismatches as build errors rather than silent runtime data corruptions. Wire it into the CI pipeline. This transforms schema drift from a monitoring problem into a build gate. Estimated effort: 1–2 weeks including schema authoring, CI integration, and backfill validation of existing files.
