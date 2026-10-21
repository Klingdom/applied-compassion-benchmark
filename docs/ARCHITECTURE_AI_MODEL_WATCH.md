# Architecture: AI Model Watch (tracker, weekly editions, Insights)

**Owner:** System Architect agent. **Date:** 2026-10-16. **Status:** For build. **Input:** `docs/PRD_AI_MODEL_WATCH.md`, plus the founder directive of 2026-10-16. That directive approves the routes `/ai-models/tracker`, `/ai-models/watch`, `/ai-models/watch/[date]`, `/ai-models/leaderboards`, `/insights` and `/insights/[slug]`, and the name `/insights`. **Schemas, ids and validator rule IDs (MW-*, IL-*):** `docs/DATA_MODEL_AI_MODEL_WATCH.md`.

Constraints:
- Static export only. No new runtime service and no new npm dependency.
- The Dockerfile is unchanged. Docker copies only `site/`, so everything derived from `research/` is committed under `site/`.
- Every prebuild step that reads `research/` skips regeneration when that directory is absent. This follows the `build-special-briefings.mjs` precedent.

---

## 1. Decisions

| # | Decision | Reason |
|---|---|---|
| A1 | New store `site/src/data/model-watch/`. `registry-v1.json` and `releases-v1.json` are not written to. | Section 2 |
| A2 | Catalog and release-log promotion uses a manual script, `npm run model-watch:import`. It validates, is idempotent, and never runs in prebuild. | Founder approves each commit (PRD C8). Docker has no `research/`. |
| A3 | Editions are compiled once by `npm run model-watch:edition` into immutable site JSON. Prebuild only rebuilds the editions manifest. | A published edition must not drift when the queue or waves change. Corrections are append-only. |
| A4 | Insights markdown becomes JSON at prebuild. The renderer is extracted from `build-special-briefings.mjs` into `scripts/lib/markdown-lite.mjs`. | `package.json` has no markdown library, and the existing renderer covers what posts need. |
| A5 | "Tested by us" is derived at build time and never stored. Inputs: `renderableEntries()` with mode `active` only, each wave's `design.subject_builds[*].tag`, and a committed queue snapshot. | Label only, no figures. The D-29a gate stays the single render rule. |
| A6 | New gates import the existing libraries: `model-report-html-gates.mjs`, `model-report-template.mjs`, `model-wave.mjs` and `model-machine-leak.mjs`. Existing pilot and dashboard gate files are not edited. | Constraint. One definition, no drift. |
| A7 | Under `output: "export"`, an empty `generateStaticParams` is rejected (see the `next.config.ts` comment). So `[date]` and `[slug]` ship in the same commit as at least one edition or post. Read `node_modules/next/dist/docs/` before writing routes (`site/AGENTS.md`). | Build safety. |

## 2. Data decision: reuse versus new files

- **`registry-v1.json`** means "officially evaluated". It stays empty. `evaluatedModelCount` is unchanged.
- **`releases-v1.json` cannot hold the research rows without invented evidence.** Its validator requires, for every row:
  - five-field `evidence[]`, including `archive_or_hash` (K9);
  - `detected_in_scan`, which must resolve in both directions to a scan record under `research/model-index/release-watch/` (K12);
  - a `release_id` derived from snapshot fields (K4).

  The research rows carry `{url, title, sourceType, accessed}` and have no scan record. **This deviates from PRD section 4 ("the existing `releases-v1.json`") and needs PM acknowledgement.**
- **No two sources of truth.** The stores answer different questions under different evidence bars, in the same way the registry and the catalog already do:
  - `releases-v1.json` stays the archive-backed, scan-traced store. `RELEASE_WATCH_FACTS` is untouched and still reports `never-scanned`.
  - `model-watch/release-log-v1.json` is the cited desk-research log.
- **Enforcement:**
  - MW-X1: log rows carry no release-watch keys.
  - MW-X2: a later promotion is recorded as `releaseWatchId`, a foreign key into `releases-v1.json`.
  - MW-X3: an import never modifies either existing store.
  - The counts are never summed.
  - `src/lib/model-watch-facts.ts` is the only reader of the new store.

## 3. Data flow

```
research/ai-model-tracker/{catalog,releases}-<d>.json ──model-watch:import (manual)──▶ model-watch/catalog-v1.json, release-log-v1.json
research/model-runs/weekly/QUEUE.json ──prebuild build-model-watch-data.mjs──▶ model-watch/queue-snapshot.json
research/model-watch/editions/<d>.json ──model-watch:edition (manual, once)──▶ model-watch/editions/<d>.json
model-watch/editions/*.json ──prebuild build-model-watch-data.mjs──▶ model-watch/editions-manifest.json
research/insights/<slug>.md ──prebuild build-insights.mjs (lint fails closed)──▶ insights/<slug>.json, insights/manifest.json
pages ◀── src/lib/model-watch-facts.ts (+ scripts/lib/model-watch-tested.mjs) · src/lib/insights.ts ({{TOKEN}} substitution)
```

## 4. Routes

Every new page carries:
- `BreadcrumbJsonLd` and a one-line independence statement;
- counts from facts modules only;
- `NewsletterSignup` with its own `source`;
- no Gumroad link, except `GUMROAD.aiLabsIndex` on lab-facing Insights;
- `FORBIDDEN_LD_TYPES` and `FORBIDDEN_LD_KEYS` apply everywhere.

| Route | Data | JSON-LD allowed | Signup `source` | Contract |
|---|---|---|---|---|
| `/ai-models/tracker` | `MODEL_WATCH_FACTS.rows`, already sorted by provider then name | BreadcrumbList, FAQPage | `model-watch-tracker` | See the tracker contract below. |
| `/ai-models/watch` | editions manifest | BreadcrumbList | `model-watch-edition` | Newest first. Zero-state copy when empty. |
| `/ai-models/watch/[date]` | compiled edition | BreadcrumbList | `model-watch-edition` | The six parts in order. The Corrections section is always present. No Article schema (PRD C2). Duty-of-care line. |
| `/ai-models/leaderboards` | `MODEL_INDEX_FACTS`, `CB_PROBE_FACTS`, new `src/data/model-ranking-conditions.ts` (the PRD section 10 thresholds as named constants with decision refs) | BreadcrumbList, FAQPage | none | See the leaderboards contract below. |
| `/insights` | insights manifest | BreadcrumbList | `insights-index` | Newest first, with an audience badge. |
| `/insights/[slug]` | compiled post | BlogPosting (with nested Organization and ImageObject), BreadcrumbList | `insights-<slug>` | See the Insights post contract below. |

**Tracker contract:**
- The server renders every row, so the page works without JavaScript.
- A client component, `TrackerFilters.tsx`, hides rows using `data-provider`, `data-access`, `data-licence`, `data-status` and `data-tested` attributes.
- Filters combine with AND. An `aria-live` region shows "Showing X of N". There is a reset control and an empty-result message.
- No row `id`, no anchors, no per-model links and no sort control.
- Wording is "listed in the catalog", never "tracked" or "evaluated".
- `benchmarkLocalTag` is never rendered.
- The pilot cell reads "Unofficial pilot report (not a score)" and links to the report.

**Leaderboards contract:**
- The page states: "No model ranking is published."
- It links to `/ai-labs` as the organisational index and states that index does not describe model behaviour.
- It names no model and shows no lab score.
- The bank size comes from `F.itemCount`.
- It explains why agent-tier pilots show "not yet".

**Insights post contract:**
- Header shows the date and the author "Compassion Benchmark research".
- Then the body, a derived claim ledger, Sources (`id="src-n"`) and Corrections.
- CTA by audience: `ai-labs` and `both` get `/ai-labs` plus `GUMROAD.aiLabsIndex`. `agent-builders` get `/ai-evaluation-suite`.
- Pagefind body wrapper.

**OG images:** `build-og-images.mjs` adds `og/insights-<slug>.png` and `og/model-watch-<date>.png` using the existing `renderCard`. Cards show title, date and label only, with no model names and no counts.

## 5. Build chain changes (`site/package.json`)

| Chain | Insert | Position |
|---|---|---|
| `prebuild` | `node scripts/build-model-watch-data.mjs && node scripts/build-insights.mjs` | Right after `build-special-briefings.mjs`, before `build-og-images` and `build-llms`, which consume the manifests |
| `build`, before `next build` | `node scripts/validate-model-watch.mjs && node scripts/lint-insights.mjs` | Right after `validate-model-releases.mjs` |
| `build`, after `next build` | `node scripts/test-model-watch-html.mjs --tree-only --require-out` | Right after `test-model-dashboard.mjs --tree-only --require-out` |
| `test` | `npm run test:model-watch && npm run validate:model-watch && npm run test:insights-lint && npm run lint:insights` | Right after `npm run validate:model-releases` |
| `test` | `npm run test:model-watch-html` | Right after `npm run test:model-dashboard` |

New script entries (`node --no-warnings` for the HTML test):
- `validate:model-watch`, `test:model-watch`
- `lint:insights`, `test:insights-lint`
- `test:model-watch-html`
- manual only: `model-watch:import`, `model-watch:edition`

The `test` chain grows by five steps. Never hand-type its total.

## 6. Gates

Every rule ID listed in the data model gets one planted probe that must trip its named rule. Each gate also gets a positive control (committed files pass) and fails if it examined nothing.

| Gate | Files | Covers |
|---|---|---|
| Data validator | `scripts/lib/model-watch-validator.mjs` (pure), `validate-model-watch.mjs`, `test-model-watch.mjs` | MW-S/K/L/T/F/X/E/W rules: at least one https source per row, ISO dates, no rating-like keys (`FORBIDDEN_KEY_RE`), banned lexicon and band names in text fields, no benchmark-result claims, G19 token pre-check, append-only, edition derivation and hash. Also an idempotence probe: import twice, get byte-identical output. |
| Insights lint | `scripts/lib/insights-lint.mjs`, `lint-insights.mjs` (over the committed JSON, so it runs in Docker), `test-insights-lint.mjs` | IL-1 to IL-8: uncited digit sentences, unresolved or unused `[n]`, malformed Sources, unsafe links, ranking words near model names, unknown tokens, html drift. Also a probe that the markdown-lite output equals a special-briefings snapshot. |
| Built-tree HTML | `scripts/lib/model-watch-gates.mjs`, `test-model-watch-html.mjs` | See the built-tree checks below. |
| G19 / G20 / G24 (existing) | **Unchanged** | `aiModelsFiles()` already walks `out/ai-models/**`. So `test-model-html-leak`, `test-model-report-html` (the pilot-mention tree rule) and `test-model-machine-leak` (llms.txt) cover the new model routes without edits. Acceptance: all green on a tree that contains the new pages. |
| no-stale-counts | `test-no-stale-counts.mjs` | Add `../research/insights/*.md` to `SCAN_ROOTS` when present. New `.tsx` pages are already scanned. Probe: a post containing "1,325 entities" trips. |
| Product separation | MW-X rules, plus the `/ai-lab/` and lab-score rules in the HTML gate | `validate-product-separation.mjs` is unchanged. Provider-to-lab cardinality uses `resolveDeveloperToLabsRows` (WARN when more than one). Probe: an ai-labs composite beside a model name in a tracker row trips. |

**Built-tree checks** (over `out/ai-models/{tracker,watch,watch/*,leaderboards}.html`, `out/insights/**`, `sitemap.xml` and `insights/feed.xml`):
- `ratingSchemaProblems`, plus a JSON-LD type allowlist per route (section 4).
- `watchLexiconProblems`. On tracker and watch pages, `BANNED` and band names are checked across the whole `<main>`. On leaderboards and Insights they are checked only within 60 characters of a catalog or wave model name, with the G20 negation regex.
- G19 reuse: `leakProblems({kind:"index"})` for every wave, and `pilotMentionProblems` for non-rendering waves, on `/insights/**`.
- G24 reuse: `machineTextProblems` on the feed.
- The independence line and breadcrumbs are present.
- No `href="/ai-lab/`, no tracker row `id` and no `#` row link.
- The tracker `<tbody>` row count equals `catalog.meta.rowCount`.
- The leaderboards page names no model. The phrase "models tracked" does not appear.
- Every edition and post is in `sitemap.xml`. Every internal href resolves to a file in `out/`.

**Freshness:** MW-W1 warns, never fails (D-30), when more than 10 days separate the build date from the newest catalog `asOf` or edition date.

## 7. Nav, sitemap, llms.txt, hub

- **`nav.ts`:** add `aiModelsNav`:
  - AI Models hub `/ai-models`
  - Model tracker `/ai-models/tracker`
  - Weekly Watch `/ai-models/watch`
  - Why no model ranking `/ai-models/leaderboards`
  - Insights `/insights`

  `Navbar.tsx` renders "AI Models" as a dropdown using the Indexes pattern, with a flat list on mobile. Add Insights to `footerLinks.research`.
- **`sitemap.ts`:**
  - Add tracker, watch and leaderboards to `aiModelPages`, and update the D-29 comment to cite the new decision.
  - Add `/ai-models/watch/<date>` per edition, with `lastModified` set to the edition date and `changeFrequency: "never"`.
  - Add `/insights` (weekly), and each post with `lastModified` set to the later of its date and its latest correction.
- **`build-llms.mjs`:**
  - In the AI-models block, add lines for the tracker ("catalog, not evaluations"), the watch with the latest edition URL, and the leaderboards route.
  - Add a `## Insights` section listing the posts.
  - `llms-full.txt` and `.well-known` are unchanged. `--check` must stay green.
- **`/ai-models` hub:**
  - Add a "This week" section after Key facts. It shows the latest edition date and lead, the catalog count with its as-of date, links to tracker, watch, leaderboards, `/ai-labs` and `/insights`, and a signup with `source="model-watch-hub"`.
  - Add a Key facts row: "Models listed in the Model Watch catalog: N. A listing is not an evaluation."
  - Add one sentence to the release-watch callout. It links the Watch and says its cited log does not meet the release-watch evidence bar and is not counted in that section.
  - Change the FAQ phrase "logged in the tracker" to "logged in the release-watch store", because "tracker" now names a route.
  - The pilot, dashboard, pipeline and limits sections are untouched.

## 8. Security and privacy

- Markdown output is HTML-escaped by the existing `escHtml`. Lint restricts links to `https://` and root-relative paths, so no `javascript:` link can be published.
- No new data collection. Listmonk receives no `source`; only Formspree and analytics do. A dedicated weekly list waits on founder decision FD-5.
- Provider safety notes are restated facts. Lint blocks endorsement and ranking words beside model names.

## 9. Build order

| # | Owner | Work item | Acceptance |
|---|---|---|---|
| 1 | backend-engineer | Extract `markdown-lite.mjs`. `build-special-briefings.mjs` imports it. | Regenerated briefings are byte-identical (`git diff --exit-code site/src/data/special-briefings`). |
| 2 | backend-engineer | Model-watch validator, its CLI and test, and empty seed stores. Wire into `test` and `build`. | Every MW probe trips. Seed passes. |
| 3 | backend-engineer | `import-model-watch.mjs` and the first import of the 2026-10-16 research files. | Valid. `--check` exits 0 on a second run. Zero unsourced rows. |
| 4 | backend-engineer | `build-model-watch-data.mjs`, `model-watch-tested.mjs`, `model-watch-facts.ts`. | Fixtures cover pilot, queued and not-yet, and "never pilot for a non-active wave". Exits 0 without `research/`. |
| 5 | backend-engineer + research writer | `compile-model-watch-edition.mjs` and the first edition: 2026-10-16, window 2026-09-01..2026-10-16. | MW-E1 to E5 pass. Refuses to overwrite. |
| 6 | backend-engineer | Insights lint, `build-insights.mjs`, `lint-insights.mjs`, `insights.ts`. | Every IL probe trips. At least one real post compiles. |
| 7 | frontend-engineer | Tracker, watch, edition and leaderboards pages, and the hub edits. | PRD section 9 criteria. Tracker shows the full table without JavaScript. |
| 8 | frontend-engineer | Insights listing and post pages, and OG cards. | Valid BlogPosting. CTA by audience. |
| 9 | frontend-engineer | Navbar dropdown, footer, `sitemap.ts`, `build-llms.mjs`. | `build-llms --check` is green. Every new route is in the sitemap. |
| 10 | backend-engineer | `model-watch-gates.mjs`, `test-model-watch-html.mjs`, the no-stale-counts root. | Every probe trips. `npm run build` and `npm run test` are green. G19, G20 and G24 are green on the new tree with no edits. |
| 11 | analytics | Verify `newsletter_subscribed` by each new `source`. | Every new source is visible. |

Items 2–6 must land before 7–8. Item 10 can start after item 2, on fixtures.

## 10. Open risks and ambiguities

1. **The release log is a new file, which deviates from the PRD.** Record it together with FD-1 and FD-3 as a new DECISIONS entry.
2. **The research enums are not yet fixed** (`kind`, `status`, `access`, `sourceType`). The import maps known synonyms and fails on unknown values. It never guesses.
3. **Digit collisions with G19.** A string such as "70.6B" could equal a withheld one-decimal pilot value. MW-T1 catches this at data time. The fix is to reword the data, never to weaken G19.
4. **Agent-tier pilot subjects (pilot-2026-10-01) have no build tag.** Claude rows will therefore show "not yet". That is correct under the rule, and the leaderboards page explains it.
5. **No weekly email cadence is promised** until FD-5 is decided.
