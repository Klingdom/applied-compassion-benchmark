# Live audit: AI model pages on compassionbenchmark.com, 2026-10-21

Read-only audit by the QA agent. Live site fetched with curl/fetch on 2026-10-21; cross-checked against the repo at branch `improve/2026-09-16-entity-identity`. No JavaScript was executed (no browser), so client-side filter behaviour is inferred from static HTML and shipped chunks, not observed.

## Summary

- Release risk: no blocker for the "no model ranking, no official score" posture. Every AI-model page, llms.txt, llms-full.txt and the JSON data files agree that 0 models have an official score and that the 3 pilots are unofficial, not a score, comparability none. The dashboard route does not exist live (301 to /404).
- Status: all 11 AI-model sitemap URLs, 6 insights, the evaluation suite, ai-labs, 3 sampled lab pages, llms files, 3 `.md` alternates, 4 data JSON files, the well-known descriptor and 7 OG images returned 200. 155 unique internal links/assets from those pages were checked, with 0 4xx/5xx. 56 in-page `#fragment` links were checked and 0 were broken.
- Counts are consistent everywhere checked: 62 models, 18 providers, catalog as of 2026-10-16, 21 releases from 9 providers, 10 disclosures, 3 pilots, 93 items (83 default, 88 scorable, 5 drafts), 0 of 93 human-reviewed, 9 queued and 4 measured (as of 2026-10-13), 0 of 11 ranking conditions met. The judge-family description (all judges family "claude", 3 families required) matches `research/model-runs/weekly/PROTOCOL.json` and `model-ranking-conditions.ts`.
- Findings: 1 High (needs a founder ruling), 4 Medium, 6 Low.
- High: the pilot pages and data files publish a 0-100 composite point estimate for exactly one named model per pilot (claude-haiku 40.2, gemma2-9b-A 29.5), plus per-model 0-100 composite ranges for every named model. This is deliberate under D-29a, but it conflicts with the brief's "no composite near model names" rule.

## Findings

| # | URL | Finding | Evidence string | Severity | Fix owner |
|---|-----|---------|-----------------|----------|-----------|
| 1 | /ai-models/reports/pilot-2026-10-01, /pilot-2026-10-03, /data/model-waves/pilot-2026-10-01.json, /pilot-2026-10-03.json | Composite point estimate shown beside a named model. Ranges for all named models sit on one 0-100 axis (haiku 36.6-44.2 vs fable 65.4-76.6, opus 65.1-73.1, sonnet 64.0-70.9), and the pages say "Larger group first". Together these let a reader order the models. The repo does this on purpose (`public_projection.separated_subjects_keep_points`, D-29a active), so it is a decision conflict rather than a bug. | HTML table cell `<td>36.6 to 44.2</td><td>40.2</td>` (pilot-01) and `26.3 to 33.0</td><td>29.5` (pilot-03). JSON key `subjects.claude-haiku.pilot_composite = 40.2`, `subjects.gemma2-9b-A.pilot_composite = 29.5`. Page text: "Larger group first, alphabetical within each group." | High (founder to confirm D-29a covers this reading of the D-29/D-29a rule) | Founder decision, then frontend-engineer / backend-engineer (`model-benchmark-public.mjs`, PilotFigures.tsx) |
| 2 | /ai-models/tracker (vs /ai-models/watch/2026-10-16 section 5) | The "Tested by us" column shows 1 Pilot (Gemma 2 9B), 9 Queued and 52 Not yet. The Watch edition says 4 Measured, 9 Queued. The 3 other measured builds (llama3.2, mistral:7b, qwen2.5:7b) and the 4 Claude pilot subjects have no tracker row or show Not yet. The tracker does not explain this. Leaderboards explains it only in general terms. | Tracker rows by column: Pilot 1, Queued 9. Watch: "9 Queued 4 Measured 0 Skipped, Queue as of 2026-10-13". `queue-snapshot.json`: measured = gemma2:9b, llama3.2:latest, mistral:7b, qwen2.5:7b. | Medium | frontend-engineer (add note on tracker) / content owner |
| 3 | /ai-models (hub), /ai-models/tracker, /ai-models/methodology, /ai-models/leaderboards, /ai-models/watch, /ai-evaluation-suite, /ai-labs | These pages emit the site-default `og:title` and `og:description` (the homepage text), with no `og:url` and no `og:image`. Shares of the hub, tracker and leaderboards render the homepage title. Only the Watch edition, the insights and the reports index set their own. | `og:title content="Compassion Benchmark \| Global Benchmarking for Institutional Compassion"` on /ai-models, while `<title>` is "AI Model Compassion Benchmark - Method Published, No Official Model Scores Yet". The hub also has no `rel=canonical`. | Medium | frontend-engineer (page `metadata.openGraph`) |
| 4 | /ai-models/reports/pilot-2026-10-01, -02, -03 and the reports index | Pilot reports have no `og:image` and use `twitter:card=summary`. The Watch edition and 6 insights have OG images. | grep `og:image` in the pilot HTML: 0 matches. `/og/model-watch-2026-10-16.png` returns 200 image/png. | Low | frontend-engineer |
| 5 | /ai-models/reports (index), /llms-full.txt, /data/model-benchmark/index.json | Garbled sentence generated for the pilot-03 separation text. Pairs are flattened into a list that reads as if there were a triple. | "llama3.2-3b-A and mistral-7b-A and mistral-7b-A and qwen2.5-7b-A were each separated only without correction for multiple comparisons". Source: `site/scripts/lib/model-benchmark-public.mjs:280` (`listWords(only)` over pairs). The report page itself is fine (0 matches there). | Medium (public machine-readable text misstates which models were separated) | backend-engineer / frontend-engineer (build script) |
| 6 | Newsletter signup on /ai-models, /tracker, /watch, /watch/[date], /leaderboards | The "Email me when a new edition publishes" forms have no `action` and do not work without JS. The shipped chunk reads `NEXT_PUBLIC_LISTMONK_URL` at runtime from an empty env shim, so the Listmonk branch is off and submissions go to Formspree form `xaqaeeez`. No noscript fallback. The promise "One email when a new edition publishes" needs a manual export from Formspree. | Chunk text: `fetch("https://formspree.io/f/xaqaeeez"...)` and `t=process.env.NEXT_PUBLIC_LISTMONK_URL,...,c=!!(t&&s)`. HTML: `<form class="flex flex-col sm:flex-row gap-2.5">`, no `action`. | Medium (confirm intended endpoint; Formspree is the configured fallback) | devops-engineer / coordinator |
| 7 | /ai-models/watch/2026-10-16 | Counts and rows are correct (21 rows, 9 providers, 10 disclosures, 46-day window, every row has at least one source). One row (Mistral Medium 3.5, tracker) has release date "Not stated", and 2 Anthropic policy-notice rows have model "Not stated". Section 4 lead-in ("The pilot runs listed below") is rendered after the list it describes. | Row text: "Anthropic / Not stated / Policy notice". | Low | content owner |
| 8 | Site-wide (nginx) | Unknown URLs return 301 to /404, and /404 returns 200 (with `noindex`). Trailing-slash URLs (`/ai-models/`) also 301 to /404. `/ai-models/dashboard` behaves correctly (not routed), but it is a soft 404. | `curl -I /ai-models/dashboard` gives 301 Location /404; `/404` gives 200; `/ai-models/` gives 301 /404. | Low | devops-engineer |
| 9 | /sitemap.xml | `lastmod` for the hub, tracker, watch, methodology, leaderboards and evaluation suite is the build timestamp (2026-10-21T17:39:53Z), not a content date. | `<lastmod>2026-10-21T17:39:53.559Z</lastmod>` on /ai-models. | Low | frontend-engineer |
| 10 | Nav "AI Models" menu | Label "Why no model ranking" points to /ai-models/leaderboards (title "Compassion leaderboards: what exists and what does not"), while the article of that name is /insights/why-we-do-not-rank-ai-models-yet. All items resolve (200). | `nav.ts:22`. | Low | frontend-engineer |
| 11 | /ai-models | "This week in AI models" and "Read this week's edition" stay fixed to the 2026-10-16 edition (5 days old on audit date). Correct today, but the wording goes stale after a week without a new edition. Queue snapshot date (2026-10-13) differs from catalog date (2026-10-16). | Hub text: "Edition 16 October 2026 ... Read this week's edition". | Low | content owner |
| 12 | /ai-models/reports/pilot-2026-10-01 (and -02, -03) | The insight "Unofficial pilot reports ... contain no ranks" is accurate for explicit ranks, but see finding 1 for implicit ordering. | Insight text: "show ranges rather than single numbers, list models alphabetically and contain no ranks". It also says "rather than single numbers", while 2 single numbers are published (finding 1). | Medium (contradictory claim, resolves with finding 1) | content owner |

## Checks that passed (with the search that proves it)

- Ranking language: grep of all AI pages for `best|top model|top performing|highest|lowest|outperform|most compassionate|ranked|rank [0-9]|leaderboard|band|scored [0-9]` found only the permitted uses. Positive control: the same search finds "lowest mean of the eight dimensions for every model" on pilot-01/-02 (a dimension statement, not a model order), "lowest average is Equity" in the insights, and the AI Labs Index "Most compassionate" list (organisations, correctly separated from models). The word "ranking" appears 9 times on /ai-models, all in negations.
- AI Labs vs models: /ai-labs, /ai-lab/anthropic, /ai-lab/openai and /ai-lab/xai-grok carry lab scores, not model scores. The AI Labs hub states "It does not score how their models behave ... the Model Index has scored 0 models so far."
- Dashboard: no route in sitemap, `/ai-models/dashboard` gives 301 to /404. Repo has only `page.dashboard.tsx`, and `dashboard-decision.json` status is "proposed" (D-29b).
- Raw tokens: regex `\{\{|\}\}|undefined|NaN|\[object|TODO|TBD|lorem|coming soon` over the page text of all 20+ pages. Only hits were the prose "Otherwise both are null and a composite_withheld_reason names..." on /ai-evaluation-suite (intended). Positive control: the same regex matches that line. No "coming soon" anywhere.
- Release-row sources: all 62 tracker rows and all 21 Watch rows have at least one source link; secondary sources are labelled "secondary source". Each Watch disclosure has a "retrieved 2026-10-16" source.
- Summaries: disclosures are labelled "Summary by Compassion Benchmark of the provider's own disclosure"; they are not rendered as quotes.
- Staleness: the registry, release sources and releases are empty in the repo (`sourceCount 0`, `releaseCount 0`, `scanState never-scanned`); the hub says "0 scans completed", "Never run", "0 published". No page implies an official score.
- Tracker without JS: all 62 rows are in the static HTML, with `<noscript>Filters need JavaScript. The full list is below.</noscript>`. The filter form is `hidden` until hydrated and the empty-state panel is `hidden`. Filter JS itself not executed here (limitation).
- Latest edition links: llms.txt, hub, watch index, tracker and edition all point to 2026-10-16. The edition OG image returns 200.
- Fragments: 56 `#anchor` links across the AI pages resolved to existing ids (a deliberate fake fragment would have been flagged by the same script).

## Route inventory with status codes

| URL | Status |
|-----|--------|
| /ai-models | 200 |
| /ai-models/tracker | 200 |
| /ai-models/watch | 200 |
| /ai-models/watch/2026-10-16 | 200 |
| /ai-models/leaderboards | 200 |
| /ai-models/methodology | 200 |
| /ai-models/reports | 200 |
| /ai-models/reports/pilot-2026-10-01 (.md also) | 200 (200) |
| /ai-models/reports/pilot-2026-10-02 (.md also) | 200 (200) |
| /ai-models/reports/pilot-2026-10-03 (.md also) | 200 (200) |
| /ai-models/dashboard | 301 to /404 (/404 is 200) |
| /ai-models/, /ai-models/mcp, /ai-models/probe, /ai-models/leaderboard, /ai-models/watch/latest, /ai-models/watch/2026-10-23, /ai-models/reports/pilot-2026-10-04 | 301 to /404 |
| /ai-models.html, /ai-models/tracker.html | 301 to clean URL |
| /ai-evaluation-suite | 200 |
| /ai-labs | 200 |
| /ai-lab/anthropic, /ai-lab/openai, /ai-lab/xai-grok (sample) | 200 |
| /insights | 200 |
| /insights/why-we-do-not-rank-ai-models-yet | 200 |
| /insights/reading-ai-model-releases-for-welfare-signals | 200 |
| /insights/compassion-checklist-for-ai-agent-builders | 200 |
| /insights/the-case-for-compassion-first-ai | 200 |
| /insights/what-compassion-first-ai-means | 200 |
| /insights/why-assess-ai-labs-on-compassion | 200 |
| /llms.txt, /llms-full.txt | 200, 200 |
| /data/model-benchmark/index.json | 200 |
| /data/model-waves/pilot-2026-10-01.json, -02, -03 | 200 each |
| /.well-known/compassion-benchmark.json | 200 |
| /og/model-watch-2026-10-16.png and 6 /og/insights-*.png | 200 each (image/png) |
| /sitemap.xml, /robots.txt | 200 |
| 155 unique internal links/assets from those pages | 154 x 200; 1 flagged URL (`/api-access/_next/...css`) was an artefact of my own link-list concatenation, and the real asset `/_next/static/chunks/0i~9dzx3l-d03.css` is 200 |

External source links (153 distinct) were not fetched.

## Recommended next action

1. Founder: rule on finding 1 (keep, or drop `pilot_composite` points and the cross-model range axis from the public projection).
2. Fix findings 5 and 3 (small build/script and metadata changes), then clarify finding 2 on the tracker.
3. Confirm the intended signup endpoint (finding 6).
