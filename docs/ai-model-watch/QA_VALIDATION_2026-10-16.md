# QA Validation: AI Model Watch + Insights (pre-publication)

Date: 2026-10-16. Validator: QA Engineer agent. Method: static read of the existing build in `site/out/` (not rebuilt, `npm test` not run), plus source and data in `site/src/**`, `site/src/data/model-watch/*.json`, `site/src/data/insights/*.json`. Scripted checks (link resolution, heading order, duplicate ids, JSON-LD types, lexicon window) were run over the built HTML. No product code was edited.

Artifacts checked against: `docs/PRD_AI_MODEL_WATCH.md` (section 9 acceptance criteria), `docs/UX_FLOWS_AI_MODEL_WATCH.md` (sections 0-7).

## Verdict: PASS WITH FIXES

No Critical findings. Two High findings block publication until fixed (both are small). Everything else is Medium/Low follow-up.

Build freshness: `site/out/` was built 2026-10-16 10:13. Three files changed after that (`site/src/data/model-benchmark/reports/pilot-2026-10-0{1,2,3}.json`, likely rewritten by the concurrent `npm test`). Re-run the build and gates after fixes anyway.

## High (fix before publishing)

### H1. Raw template tokens visible in two published posts
- Pages: `/insights/what-compassion-first-ai-means`, `/insights/why-assess-ai-labs-on-compassion`.
- Evidence (`site/out/insights/what-compassion-first-ai-means.html`): `We break that into {{DIMENSION<em>COUNT}} dimensions and {{SUBDIMENSION</em>COUNT}} subdimensions:`. Same pattern in the other post: `apply the same {{DIMENSION<em>COUNT}} dimensions and {{SUBDIMENSION</em>COUNT}} subdimensions`. The claim-ledger table on the first page shows the resolved text ("8 dimensions and 40 subdimensions"), so the page contradicts itself.
- Expected: tokens resolve to 8 and 40 (`INSIGHT_TOKEN_VALUES` in `site/src/lib/insights.ts`).
- Root cause: `renderInline` in `site/scripts/lib/markdown-lite.mjs` line 42 (`/(?<![_])_([^_]+)_(?![_])/`) treats the underscore in `{{DIMENSION_COUNT}}` and the underscore in `{{SUBDIMENSION_COUNT}}` as an italic pair, so the compiled `html` no longer contains valid tokens and `substituteTokens` finds nothing to replace. Posts with a single token per paragraph (checklist, case-for) are unaffected. The lint (IL-8) checks `bodyMarkdown` tokens and html drift, not that no `{{` survives in the compiled html, so it passed.
- Severity: High. Customer-visible broken copy on two of six posts, one of them the lead definitional post.
- Fix: protect `{{...}}` from the italic rule in the renderer (the frozen snapshot test `test-markdown-lite.mjs` will need a deliberate update) or substitute tokens before inline rendering; add a lint rule "no `{{` or `<em>` inside a token in compiled html" and a post-build grep for `{{` in `site/out/**`.

### H2. Edition "Safety and welfare disclosures" are editorial summaries presented as quotes
- Page: `/ai-models/watch/2026-10-16`, section 3. Lead-in: "What providers said about their own releases. We quote; we do not assess." The edition lead (also shown on `/ai-models/watch`) says "We quote what providers say and do not assess it."
- Evidence: each entry is `<figure><blockquote cite="...">TEXT</blockquote>` where TEXT is our own `safetyNote` summary, with the footer "Provider's own disclosure, restated." Examples: "Independent evaluation access policy; Anthropic says it cannot veto METR publications but may require narrow redactions."; "Meta describes CBRN and cyber safeguards under its Superintelligence Scaling Framework; full safety report promised but not yet published."
- Expected (PRD sections 3 and 9, UX 3b): a verbatim provider quote with source; "No paraphrase in the quote, no judgement words in the lead-in." Task brief: "disclosures are quotes with sources".
- Actual: none of the 10 entries is verifiably verbatim; they are paraphrases wrapped in `blockquote`/`cite`, so the markup and the lead-in claim a quote the text does not deliver. Several entries also carry our own observation or comparison rather than the provider's words:
  - Anthropic usage policy: "No stated changes on minors, self-harm or emotional dependence." This is our reading of an absence, inside "Provider's own disclosure".
  - Haiku 5.5: "cyber safeguards stricter than Haiku 4.5 but looser than Sonnet 5.5."
  - GPT-6 Astra: "lower monitorability than GPT-5.6 Sol".
  - Gemini 4 Argon: "Model card lists child-safety policies", but the only linked source is the blog post; the model card appears in the sources list as "seen in search results" (see M2), so this line is not supported by a retrieved source.
- Severity: High. It attributes wording to named providers on a press-facing page and weakens the no-assessment promise.
- Fix (either): supply verbatim quoted text (with quotation marks) from the retrieved source for each entry; or change the lead-in to "What providers disclosed about their own releases, summarised by us", render as a normal list (not `blockquote`), and remove the absence-observation and cross-model comparatives. Add a comparative check ("stricter|looser|lower|higher|better ... than <model>") to the edition gate for the disclosures block.

## Medium

- M1. Duplicate coverage text in edition section 1. The callout paragraph ("Scanned for this window: ... Not scanned: ...") is followed by a second paragraph repeating "Scanned: ... Not scanned: ..." (`site/src/app/ai-models/watch/[date]/page.tsx` lines ~165-177 render both `ed.coverageStatement` and `ed.coverage.*`). The "Not scanned" items are capitalised and run together with semicolons and commas. Render one version; lower-case and bullet the items.
- M2. Truncated source titles and an unretrieved source shown as retrieved. Edition sources list: "Google DeepMind model card: Gemini 4 Argon (seen in search results, (opens in a new tab) (deepmind.google, retrieved 2026-10-16)" and "Claude Fable 5.1 and Mythos 5.1 system card (linked from docs; (opens in a new tab) ...". Titles are cut mid-parenthesis in `editions/2026-10-16.json`, and "seen in search results" contradicts "retrieved 2026-10-16". Fix the titles and either retrieve the model card or drop it.
- M3. Hub "This week" block leads with a non-model row. `/ai-models` shows "Anthropic | Not stated | Other" (an evaluator-access notice) as one of three lead lines (`ai-models/page.tsx` ~lines 271-274). "21 new releases logged" also counts deprecations and policy notices (the edition lead says "releases, deprecations and policy notices"). Pick named-model rows, or relabel to "items logged".
- M4. Hub release-watch section contradicts the edition on its face. `/ai-models#release-watch`: "No release scan has ever run ... Compassion Benchmark has not yet looked", "0 Scans completed", FAQ "tracks 0 confirmed releases", while the same page's This-week block and the edition say official pages were scanned for 18 providers. A clarification exists ("The Model Watch keeps a separate cited log ... not counted in this section") but comes after the "has not yet looked" callout. UX section 1 item 6 asked for the callout to be replaced by scan state from the edition. Reword the callout to say the release-watch register (evidence-bar store) has never run a scan and that the Model Watch log is separate.
- M5. Factual inconsistency in the "why we do not rank" post. It says all judges are from Anthropic's Claude family and "models from that family cannot be subjects at all". The site also publishes `pilot-2026-10-01` (four Claude models judged by Claude models; wave design: `judge_family` "same family as subjects (all Claude)", `excluded_judges` ["claude-haiku"]), described on the hub as "The judges were Claude models, not people". Reword to "now cannot be subjects" or note the 2026-10-01 pilot as the exception.
- M6. Cross-model comparatives in release summaries and disclosures that the lexicon gate does not cover: "at a lower cost than GPT-6 Astra" (GPT-6.1 Sol), "performs at Fable 5.1 level on most work" (Opus 5.5), plus the Haiku and GPT-6 Astra disclosure comparatives in H2. Attribute consistently ("Anthropic says ...") or remove.
- M7. Focus is lost on zero results at widths under 720px. `TrackerFilters.tsx`: `resetRef` is attached only to the "wide" bar's Reset button (`idSuffix === "wide"`); below 720px that bar is `display:none`, so `.focus()` does nothing. UX 7.7 requires focus never lost on filter change. Attach the ref to the visible bar, or move focus to the result message.
- M8. Header nav: desktop "AI Models" is now a `<button>` with no href. In the static HTML the header shows "AI Models" as plain text; without JS no header route reaches the hub. The footer "AI Models" column lists tracker, watch, leaderboards, method and insights but not the hub `/ai-models`. The submenu does include "AI Models hub". Same pattern as Indexes/Tools, so consistent, but add the hub to the footer column. Also `aria-current="page"` is set on a button, and Insights sits under AI Models rather than Updates (UX section 6); acceptable deviation.
- M9. Hand-typed data finding in an evergreen post. `why-assess-ai-labs-on-compassion`: "the dimension with the lowest average is Equity". True today (computed from `site/src/data/indexes/ai-labs.json`: EQU 2.424, next lowest ACC 2.603) but not a token and will drift when scores change. Derive it at build or date-stamp it in the claim ledger.
- M10. Leaderboards condition wording: "The number of open claim audits is 0." with status "Status unknown" reads as a present-tense fact. Reword to "must be 0".

## Low

- L1. Mixed date formats: ISO in tables, long form in titles and lead ("16 October 2026"), month-only `releaseDate` in 12 tracker rows (e.g. "2026-08", "2025-11"), "Not stated" in 1.
- L2. Tracker filter option says "API", the table cell says "API only".
- L3. Citation markers render `<sup><a href="#src-n">[n]</a></sup>`; UX 5b asks for accessible name "Source n". Add `aria-label`.
- L4. Repeated identical link text within one row ("anthropic.com source" twice, "huggingface.co source" twice). Add the document title or an index.
- L5. `/ai-models/tracker`, `/watch`, `/leaderboards`, `/insights` have no og:image (only the edition and posts do). Hub and methodology have no canonical link (hub had none at HEAD either). No site-wide default og:image was found.
- L6. Insights listing: filter has All / Labs / Agent builders (UX listed "Press and policy"); all six posts share one date so order is arbitrary (slug order); post "On this page" omits Sources and Corrections; "Back to text" links to the top of the body, not the cited marker.
- L7. Edition section 4: text says "The pilot runs listed below" but the report links render above it.
- L8. Edition queue shows "4 Measured" next to 3 pilot reports with no explanation; only one measured build (Gemma 2 9B) appears as "Pilot" in the tracker because the other tested builds are not in the catalog. Add one explanatory line.
- L9. Leaderboards condition sources cite internal IDs (D-29b, BLK-005, D-40) that mean nothing to the public. Link or gloss.
- L10. Post "reading AI model releases" has no worked example from the 2026-10-16 edition (PRD section 5 row 5 asked for one). Posts also refer to "our internal model-testing proposal" and "the founder".
- L11. Post 3: "The Commission set August 2026 as the date the transparency rules take effect" is written after that date, with no statement of whether it now applies.
- L12. Footer (pre-existing, all pages) still links Score-Watch Alerts; PRD C6 says not to link it from new content. Not introduced here.
- L13. Nav label "Weekly Watch" implies weekly cadence while signup copy says "No promise of weekly timing" (FD-5 unresolved).
- L14. Hub has no dedicated closing independence Callout (UX 0); independence is carried only by existing FAQ and footer copy.

## Results by check area

### 1. Content correctness - PASS (except H2)
- Catalog count: `catalog-v1.json` `meta.rowCount` 62 = tracker "62 Models listed" = hub "Catalog as of 2026-10-16: 62 models listed with sources. Listed is not evaluated." = 62 `<tr data-row>` in `tracker.html`. Providers: 18 distinct `providerSlug`, matches the 18-option Provider filter and the edition's "eighteen".
- Edition: `editions/2026-10-16.json` has 21 releases, 10 disclosures, 30 sources; built page shows 21 release rows (date-descending then provider-alphabetical, verified), 10 disclosure figures, 30 sources. Lead counts come from tokens (`leadSourceProblems` rejects typed digits). Window 2026-09-01..2026-10-16 = 46 days inclusive, correct. Hub "21 new releases ... from 9 providers": 9 distinct providers (Anthropic, Meta, NVIDIA, IBM, Google DeepMind, Mistral AI, OpenAI, xAI, DeepSeek), correct.
- Every release row has at least one source link; 0 catalog rows without sources.
- Queue: `queue-snapshot.json` 9 queued, 4 measured, 0 skipped = edition section 5. Tested-by-us derivation checked against waves: Gemma 2 9B is the only "Pilot" (tag `gemma2:9b` in `pilot-2026-10-03`), 9 "Queued", 52 "Not yet" (1 + 9 + 52 = 62).
- "Measured" section links the 3 pilot reports (10-01, 10-02, 10-03), each labelled "unofficial; not a score", with no figures; consistent with `waves/manifest.json` and the hub's three pilot summaries. (Wording issue L7.)
- Hand-typed counts in new TSX: none found in `tracker/page.tsx`, `watch/**`, `leaderboards/page.tsx`, `components/model-watch/**`. Leaderboards "50 labs scored" comes from `getIndexEntityCount("ai-labs")` and matches `ai-labs.json` (50).
- Disclosures-as-quotes: FAIL, see H2.

### 2. Policy - PASS
- Lexicon: the `LEADERBOARD_TERMS` 60-character window plus extra comparatives (ahead, behind, better, superior, safest, etc.) run against every catalog and edition model name over tracker, watch, edition, leaderboards, hub and all six posts: 0 hits. No band names near models; the only band text is pre-existing hub copy ("5-band vocabulary", glossary) with no band names. Comparatives the gate does not cover: M6/H2.
- No per-model figures outside pilot reports: tracker and edition carry spec facts (parameters, context, prices) from provider sources, no scores, ranks or percentages for models. Post 3 cites a provider's self-reported "65-80% reduction" on `/insights` only, labelled self-reported.
- Leaderboards: "No model ranking is published. This is not a ranking page." Links `/ai-labs` as the live organisational leaderboard with "does not describe model behaviour"; 11-row conditions checklist with statuses from `model-ranking-conditions.ts` (0 met, 2 unknown, 1 in progress); no lab score shown; links Insights post 6.
- Paid links: only `GUMROAD.aiLabsIndex` (`https://compassionbenchmark.gumroad.com/l/eagls`), on the 5 lab-facing or shared posts (not the agent-builders checklist). No gumroad link on any `/ai-models/**` page.
- Independence statement present on tracker, watch, edition, leaderboards (shared `IndependenceCallout`) and on lab-facing posts; the agent-builders post has an independence sentence in its body. Hub: L14.
- JSON-LD types found: ResearchOrganization, WebSite, BreadcrumbList, FAQPage (hub, tracker, leaderboards), BlogPosting (posts only). No Dataset/ItemList/Rating/Review/AggregateRating/Product/Offer on any checked page.
- Signup sources distinct: `model-watch-hub`, `model-watch-tracker`, `model-watch-hub-list`, `model-watch-edition`, `model-watch-leaderboards`, `insights-list`, `insights-<slug>`. No "Friday highlights" wording remains.

### 3. UX / a11y - PASS
- Each page has exactly one h1, no heading-level skips, no duplicate ids, `lang="en"`, `main` and `nav` landmarks, visible breadcrumb on each page.
- Tracker: 5 labelled selects (10 select/label pairs because the wide and narrow bars are both in the HTML, ids suffixed, no duplicates); `form role="search" aria-label="Filter models"`; one `aria-live="polite"` count; filter block has `hidden` until JS mounts; `<noscript>` line "Filters need JavaScript. The full list is below."; full 62-row table and the mobile card list are server-rendered. Table has `caption` and `th scope`. No sort controls, no row links or anchors. Reset appears only when a filter is active. Focus issue: M7.
- Edition: six `h2` sections with the specified ids; `blockquote cite`, `time datetime`, table caption present. No prev/next on the only edition (correct); "All editions" link present.
- Link resolution: every internal href on the hub, tracker, watch, edition, leaderboards, `/insights` and the 6 posts resolves to a file in `out/` (badLinks [] on every page). All in-page and cross-page `#anchors` exist, including every `#src-n`. OG image URLs for the edition and all six posts exist in `out/og/`.
- Citations: `<sup><a href="#src-n">` targets `<li id="src-n">` for all posts (L3 for accessible name).

### 4. Copy quality - FAIL on H1, otherwise minor
- Unsubstituted tokens: H1. No other `{{`, raw `**`, `[n](` or "undefined/NaN" artifacts found in any page.
- Awkward text: M1, M2, L7. Empty states exist (tracker zero-result message, "No corrections yet.").
- Dates: L1.

### 5. Regressions - PASS
- `/ai-models` still contains: method link, pilot reports (3 pilot cards, `/ai-models/reports`), release-watch section (`#release-watch`), key facts, limits, run log, records, run-it-yourself, and the 10-question FAQ with FAQPage JSON-LD. New This-week block, entry cards and signup present.
- Mobile menu markup (source): `Navbar.tsx` mobile panel renders an "AI Models" heading with all six `aiModelsNav` links and excludes AI Models from the generic list, so no duplicate. The panel only renders when opened, so it is not testable from static HTML; recommend one manual mobile pass.
- `sitemap.xml` contains `/ai-models/tracker`, `/watch`, `/watch/2026-10-16`, `/leaderboards`, `/insights` and all 6 post URLs. `llms.txt` lists the same routes with "listing is not an evaluation" and "no model ranking is published" wording.
- No dashboard output: `out/ai-models/dashboard*` does not exist; `dashboard-decision.json` status is "proposed".

### 6. Security quick-check - PASS (notes)
- Query-string readers: `TrackerFilters.tsx` and `InsightsFilter.tsx` read `window.location.search`; values are only compared against `data-*` attributes and used as controlled `<select>` values, never inserted as HTML; no `dangerouslySetInnerHTML` receives them. The insights filter whitelists `audience`. `history.replaceState` writes only known keys. No injection path found.
- `dangerouslySetInnerHTML` in new routes: Insights post body (`insights/[slug]/page.tsx` line 139) and JSON-LD scripts. Post HTML is compiled at build time from committed `research/insights/*.md` by `markdown-lite.mjs`, which HTML-escapes all text first (`escHtml`) and emits a fixed tag set; lint IL-7 restricts links to https or root-relative. Risk is limited to our own committed content. Hardening notes: the renderer itself does not validate URL schemes (relies on the lint), and JSON-LD uses `JSON.stringify` without escaping `<`, so a title containing `</script>` would break out. `getInsight` validates the slug against `^[a-z0-9]+(?:-[a-z0-9]+)*$` before touching the filesystem.
- All external links checked carry `rel="noopener noreferrer"` (0 `target=_blank` links without it).

## Recommended next actions
1. frontend-engineer: fix H1 (renderer or token pass), add a post-build grep for `{{` over `site/out/**`; fix M7.
2. Content owner (research agent / coordinator): resolve H2 (verbatim quotes or an honest "summarised" framing), M1, M2, M5, M6, M9.
3. frontend-engineer: M3, M4, M8 copy and structure tweaks; L-items as capacity allows.
4. Rebuild, re-run `npm test`, the model HTML gates and the leak tests; QA to re-verify H1 and H2 on the rebuilt `site/out/` before deploy.

## Blocker status
Publication is blocked on H1 and H2. All other items are follow-ups; none affects data integrity or the no-ranking policy.
