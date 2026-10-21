# PRD: AI Model Watch (model tracker, weekly editions, Insights)

**Owner:** Product Manager agent. **Date:** 2026-10-16. **Status:** Draft for build. Changes no data, route, score or decision.
**Founder directive (2026-10-16, verbatim):** "Please work autonomously to create a new and improved section of the website that focuses on identifying current list of AI models, weekly announcements of new versions and models, weekly analysis and reporting of models, and any other helpful information and content for benchmarking and compassion leaderboards. Expand and improve on this concept and publish great content, pages, and products related to continuous AI model assessments and reporting. Also create blog pages for AI Agents and AI labs that explain the value and benefits of compassion first AI and ML."

Builds on: `docs/PRD_MODEL_BENCHMARK.md`, `docs/PRD_RELEASE_WATCH_AND_BYO_SCORING.md`, `docs/UX_FLOWS_MODEL_BENCHMARK.md`, `docs/MODEL_TESTING_V2_PROPOSAL.md`; DECISIONS D-29, D-29a, D-30, D-40, D-52, D-56.

---

## 1. Problem and users

**Problem.** Model releases are frequent. People who need to know "what shipped, what did the provider disclose about safety or welfare, and has anyone independent measured how it treats people in distress" get vendor marketing or anecdote. This site has the only compassion instrument for this question, but `/ai-models` shows no current model list, no release record and no recurring reason to return. `registry-v1.json` and `releases-v1.json` are empty by design (0 scans ever run), and the empty state reads as "nothing here".

**Job to be done.** "Show me, with sources, what AI models exist and what is new this week, and tell me honestly what Compassion Benchmark has and has not measured."

**Why now.** Source data is being researched (`research/ai-model-tracker/catalog-2026-10-16.json`, `releases-2026-10-16.json`). The weekly pilot queue (`research/model-runs/weekly/QUEUE.json`) holds queued builds. The 8-dimension / 40-subdimension framework (`site/src/data/dimensions.ts`) is mature, so there is something real to publish weekly.

| Persona | Role | Need |
|---|---|---|
| Journalist / policy analyst | Primary | A dated, cited weekly digest of releases and safety/welfare disclosures, plus a truthful "tested or not" status |
| AI-agent builder / ML engineer | Primary | A neutral catalog (access, licence, context) and a reason to build compassion-first behaviour into agents |
| AI lab policy / safety / trust staff | Primary (Insights audience, not a payer) | Understand the benchmark and the value case before they are assessed |
| Enterprise AI buyer | Secondary | Awareness; paid concepts are founder-gated (section 7) |

Buying context at MVP: nothing new is paid. Growth is free email signups feeding the existing AI Labs Index purchase.

## 2. Hard constraints and how this PRD respects them

| # | Constraint | How the design respects it |
|---|---|---|
| C1 | No per-model rank, leaderboard, band or composite | The catalog has no score, sort-by-result, or ordering by merit. Default sort is alphabetical by provider then name. "Tested by us" is a three-value status label (pilot / queued / not yet) with no figure. Pilot figures stay only in D-29a reports, linked, never copied into the tracker or editions. |
| C2 | Gates: LEADERBOARD_TERMS within 60 chars of model names, G19/G24, banned lexicon (`site/scripts/lib/model-report-template.mjs`), forbidden JSON-LD | All new `/ai-models/**` copy and templates are written to pass existing gates unchanged. New routes are added to gate coverage, not exempted. No `Dataset`, `ItemList`, `Rating`, `Review` or `AggregateRating` JSON-LD. Allowed: `BreadcrumbList`, `Article`/`BlogPosting` (insights only), `FAQPage`. |
| C3 | Compassion leaderboard that legitimately exists is the AI Labs index | `/ai-models/leaderboards` (name below) explains and links to `/ai-labs` (organisational, published scores). No lab score appears in any model table, edition or catalog row. Product-separation test extended to the new routes. |
| C4 | Catalog and releases are factual, cited, never ratings | Every row requires at least one `sources[]` entry. Validator rejects a row with none. Fields are only those in the research files. `notes` is factual and lint-checked for evaluative words. |
| C5 | No hand-typed counts, no invented statistics | All counts derive from JSON at build time. Insights posts may state only claims cited inline or derived from repo data (`entityCount.ts`, `dimensions.ts`, `ai-labs.json`). A post lint fails an uncited number. |
| C6 | No new paid products, no new Gumroad URLs | Shipped pages link only existing `GUMROAD.aiLabsIndex` and `NewsletterSignup`. Paid concepts are described here only. `SCORE_WATCH` stays paused; do not link it. |
| C7 | Independence | Every new page carries a one-line independence statement. Providers cannot pay for catalog inclusion, edition coverage, tested status or wording. A corrections channel exists (dated, append-only, per D-29a item 7). |
| C8 | Weekly automation is founder-gated | PRD defines runbook and format only. Editions are authored by an agent session and committed on founder approval. No scheduler or unattended commit is built. |
| C9 | D-29 caps pages; D-30 says no releases route until content justifies it | This is a D-29/D-30 amendment (decision FD-1). Content now exists, so D-30's condition is met. No per-model routes or anchors, which remains a D-29 rule. |

## 3. Information architecture

Routes under the existing `/ai-models` hub (static export):

| Route | Purpose | MVP |
|---|---|---|
| `/ai-models` | Refreshed hub: adds a "This week" block (latest edition lead, catalog count and freshness from data), tracker and editions links, AI Labs link, signup. Existing method and pilot content stays. | Yes |
| `/ai-models/tracker` | Model catalog. Table with filters: provider, access (open-weights / API), licence, status, tested by us (pilot / queued / not yet). Columns from catalog fields with a sources cell. | Yes |
| `/ai-models/watch` | Edition listing, newest first, plus signup. Zero-state copy if no editions. | Yes |
| `/ai-models/watch/[date]` | Dated edition page. First: `/ai-models/watch/2026-10-16`. | Yes |
| `/ai-models/leaderboards` | "How we will rank models and what exists today": explains that the AI Labs index is the live compassion leaderboard (organisations), that no model ranking exists, and the gates and conditions for opening one. Honest about the current state. | Yes |
| `/ai-models/providers` | Provider view: models grouped by provider, link to the lab's `/ai-labs` entity page when one exists, with the two products kept visually separate. | Should-wait |
| `/insights`, `/insights/[slug]` | Blog (section 5) | Yes |
| `/ai-models/methodology`, `/ai-models/reports/<run_id>` | Unchanged | n/a |

Navigation: add Tracker, Weekly Watch, Insights under the AI Models grouping in `site/src/data/nav.ts`; sitemap entries for all new routes.

**Why `/insights`, not `/blog`.** The audience is institutional (labs, agent teams, policy) and posts are argued evidence pieces, not announcements. `/updates` already holds briefings, so "Insights" avoids a collision and avoids implying a news feed. It sits outside `/ai-models/**`, so the 60-char leaderboard-term gate is not triggered by prose about "compassion leaderboards" for labs, but posts must still never name a model next to a ranking word.

**Tracker design rules.** One page, no per-model routes or anchors. Status values come from the release data: `status` is the factual lifecycle value in the catalog (for example current / deprecated), not quality. "Tested by us" derives mechanically: `pilot` if a rendered D-29a report in the manifest includes the model's `benchmarkLocalTag` (link to the report, no figure); `queued` if the tag is `queued` in `QUEUE.json`; else `not yet`. "Pilot" is never shown for a wave whose decision is not `active`. A model absent from the catalog is never implied unevaluated.

**Edition format (fixed template, `site/src/data/model-watch/editions/<date>.json`).**
1. Window and as-of date; what was and was not scanned (a scan that did not run is not "nothing found").
2. New releases: one row per `releases` entry (date, provider, model, kind, summary, sources).
3. Safety and welfare disclosures: entries with `safetyOrWelfareRelevant: true`, quoting `safetyNote` with source. Factual restatement of the provider's own disclosure, labelled as such. No assessment.
4. What we measured this week: pilot or wave status from the manifest, linked; "nothing published" is a valid statement.
5. Queue status: derived from `QUEUE.json` (queued, measured, skipped), no timelines promised.
6. Corrections (append-only), sources list, independence line, signup.

**First edition:** dated 2026-10-16, window 2026-09-01..2026-10-16, built from `releases-2026-10-16.json`.

**Weekly runbook (authoring, founder-approved commit).** Monday scan of provider release pages and model cards; update catalog and releases JSON with sources; run validator; draft edition; run gates (`npm run test`, model HTML gates, leak tests); founder approves commit and deploy; edition published by Friday. Target cadence 1 edition per 7 days. Missed week: next edition states the gap in its window.

## 4. Data layer

New: `site/src/data/model-benchmark/catalog-v1.json` and the existing `releases-v1.json`, populated from the research files after validation. Validator rules: required fields, at least one source with URL and retrieval date, unique `id`, `benchmarkLocalTag` matches a QUEUE/manifest tag or is null, no evaluative words in `notes`/`summary`, no score-shaped fields. `registry-v1.json` stays empty and unchanged: it means "officially evaluated", which the catalog is not. `evaluatedModelCount` unchanged; catalog size is a separate fact (`catalogModelCount`) never summed with it. The tracker page must never print "models tracked" in a way that could read as "models evaluated".

## 5. Insights (blog): initial six posts

Routes `/insights/<slug>`, MDX or JSON-driven, `BlogPosting` JSON-LD, author "Compassion Benchmark research". Each post: one factual claim ledger (every figure cited or derived), dated, with corrections. No claims that compassion-first design raises revenue, retention or safety unless a cited primary source supports it; where evidence is thin, the post says so. CTAs only to existing assets.

| # | Working title | Audience | Thesis | Outline | Evidence types | CTA |
|---|---|---|---|---|---|---|
| 1 | What "compassion-first AI" means, and what it does not | Labs, agent builders | Compassion-first is a measurable behaviour set (recognise, respond, reduce suffering), not tone or politeness. | Definition; the 8 dimensions; what it excludes (sycophancy, sentimentality); where it differs from safety and refusal | `dimensions.ts`; methodology pages | Read methodology; weekly Watch signup |
| 2 | Why AI labs should be assessed on organisational compassion, not only model behaviour | Labs | Governance, incident response and disclosure are separate from model behaviour, and the AI Labs index measures the former. | Two products, two questions; how labs score (from published data); common gaps visible in public scores | `ai-labs.json` aggregates computed at build; scoring methodology | AI Labs Index purchase; `/ai-labs` |
| 3 | The business case for compassion-first AI, with the evidence we actually have | Labs, enterprise | Duty-of-care exposure and trust are the credible case; we separate cited evidence from hypothesis. | Risk side (public incident records, regulation, provider usage policies); trust side; what is unproven | Cited regulatory texts, provider policies, published incident reports; explicit "no evidence yet" sections | `/ai-labs`; signup |
| 4 | A compassion checklist for people building AI agents | Agent builders | Agents act, so the failure modes are actions (silent escalation, boundary errors), not only words. | Map the 8 dimensions to agent design decisions: distress recognition, handoff, boundaries, accountability; 5 testable design checks | `dimensions.ts` subdimensions; D-52 self-assessment design; public agent-safety guidance | `/ai-evaluation-suite` (self-check, unofficial); agent self-assessment pages if live; signup |
| 5 | How to read an AI model release for welfare and safety signals | Journalists, buyers, builders | A release note can be read for specific, checkable disclosures; absence of a disclosure is a fact, not a verdict. | What to look for in a model card; worked example using the 2026-10-16 edition entries (cited); what independent testing can and cannot show | Edition JSON; provider model cards (cited) | Weekly Watch; `/ai-models/methodology` |
| 6 | Why we do not rank AI models yet, and what would change that | Press, researchers, labs | Declining to rank is a methodological position with stated conditions. | Public item bank problem; judge-family limit; pilot status; gates; conditions from Model Testing v2 | `MODEL_TESTING_V2_PROPOSAL.md`; D-29/D-29a; task-bank validation counts from facts modules | `/ai-models/leaderboards`; signup |

Posts 2 and 3 are lab-facing, 4 is agent-facing, 1/5/6 are shared. Post 3 carries the highest claim risk; if its evidence ledger is thin, ship it as a clearly labelled "what we know and don't" piece or defer it.

## 6. Products

Shipped with this work: (a) free weekly AI Model Watch email using `NewsletterSignup` with `source` tags `model-watch-hub`, `model-watch-tracker`, `model-watch-edition`, `insights-<slug>`; (b) existing AI Labs Index (`GUMROAD.aiLabsIndex`) as the paid path from lab-facing content. Note: the weekly email needs a Listmonk list or a sending process; until the founder confirms, signup copy says "email when we publish a new edition", with no cadence guarantee beyond the runbook target.

## 7. Future paid concepts (founder decision, not shipped, no links)

| Concept | Description | Independence guard |
|---|---|---|
| Pre-release compassion assessment for labs | Lab-requested, scored on the standard instrument, results published regardless | Fee covers access and interpretation only; results and score are never conditional; publication not suppressible. High independence risk, needs counsel review. |
| Agent self-check pack | Guided use of `/ai-evaluation-suite` / D-52 environment with a report template | Self-assessments stay unofficial, no composite |
| Enterprise model-selection brief | Catalog plus disclosure comparison, not a ranking | Must not rank models; factual comparison only |

Each needs founder pricing and a Gumroad URL before any page links to it.

## 8. Metrics

| Metric | Baseline (2026-10-16) | Target | Measurement |
|---|---|---|---|
| Editions published | 0 | First edition by 2026-10-16; 4 in the first 4 weeks after founder cadence approval | Count of edition JSON files |
| Edition cadence adherence | n/a | 90% of weeks have an edition, 8-week view | Dates vs 7-day windows |
| Catalog freshness | No catalog | At most 10 days since last catalog/edition update | Max `asOf` across catalog and editions; build warning (not failure, per D-30) at more than 10 days |
| Sources per entry | n/a | 100% of rows have 1 or more; target mean at least 2 for releases | Validator output |
| Newsletter signups by source | Not instrumented for these sources (`trackEvent newsletter_subscribed` exists with `source`) | Establish baseline in the first 2 weeks, then set target; do not assume one | Analytics events by `source` |
| Page views for new routes | 0 | Baseline in first 2 weeks | Analytics |
| Insights engagement | 0 | Baseline in first 4 weeks | Analytics, signup conversion per post |
| Gate integrity | Gates pass | 0 gate failures or exemptions added | CI |

Launch metric: all MVP routes live, all gates green, 0 uncited rows. Post-launch metric: 4 consecutive weekly editions and non-zero signups attributed to `model-watch-*` sources. No revenue target is set; revenue cannot be attributed to this work at MVP (flagged, not assumed).

## 9. Acceptance criteria

**All pages:** build passes (`npm run test`, model HTML gates, leak tests, product-separation test, no-stale-counts); no ranking, "best", "top", "leader", "most compassionate" within 60 characters of a model name on `/ai-models/**`; no model figure outside pilot reports; independence line present; counts are build-derived; breadcrumbs present; no forbidden JSON-LD.

**Hub:** shows latest edition date and catalog count with as-of date from data; states that no model has an official score (while true); links tracker, watch, leaderboards, `/ai-labs`.

**Tracker:** every row shows provider, name, release date, status, access, licence, and at least one clickable source; filters combine (AND) and show a result count and a reset; empty filter result has an explanatory message; no sort by result; no per-model link or anchor; each "tested by us" value derived by rule in section 3; works without JavaScript for the full unfiltered table.

**Watch listing / edition:** edition follows the six-part template; every release row has a source; safety/welfare block quotes the provider's disclosure with source and contains no judgement words; section 4 matches the manifest; edition states window and scan coverage; page has corrections section; first edition 2026-10-16 covers 2026-09-01..2026-10-16 exactly.

**Leaderboards:** states plainly "no model ranking is published"; lists the gates and the conditions (below); names `/ai-labs` as the live organisational leaderboard and states it does not describe model behaviour; no lab score is shown next to a model.

**Insights:** 6 posts, each with date, author, claim ledger, cited sources, CTA to an existing asset only; no uncited number; no unsupported efficacy claim; lab-facing posts include the independence statement.

**Signup:** each placement uses a distinct `source`; success and error states exist (component already provides).

## 10. Conditions under which a model leaderboard could open (from Model Testing v2)

All must hold, and the founder must decide (FD-2): protocol `weekly-v2` ratified; D-29b ratified and active; cross-family judge panel (3 families) operating; blinded or secure item pool (current 33-item bank is public-permanent, so cross-model comparison on it is invalid); items human-validated per D-40 coverage (at least 3 rated items in every dimension); human rating panel exists (BLK-005); variance check and judge-agreement floors met; two consecutive clean waves under per-wave approval; claim audit zero open; hosted vs local tiers never on one axis unless declared; legal and duty-of-care review. Even then, the first form would be separated/not-separated groupings with ranges, not an ordinal list, unless the founder decides otherwise.

## 11. Non-goals

Per-model pages; any model score, band, rank or composite; recommending a model for crisis use (duty of care, D-29); lab scores applied to models; paid placement or sponsored coverage; real-time or daily feed; user comments; automated scraping publishing without review; new Gumroad products; scheduler/unattended commits; Score-Watch promotion (paused).

## 12. Risks

| Risk | Mitigation |
|---|---|
| Catalog read as a ranking or "evaluated" list | Alphabetical default, no scores, separate `catalogModelCount`, explicit wording, gates |
| Factual errors in releases | Primary-source requirement, retrieval dates, corrections log |
| "Tested: pilot" implies quality | Label links to unofficial report, no figure, shown only when D-29a active |
| Cadence lapses, stale content | Freshness warning, gap statements in next edition, runbook target of 1 per 7 days |
| Blog overclaims benefits | Claim ledger, uncited-number lint, "no evidence yet" sections |
| Doorway/thin-content SEO penalty | No per-model pages; editions carry original synthesis |
| Weekly workload exceeds founder approval bandwidth | One approval per edition; FD-4 for standing authority later |
| Newsletter list not wired for a weekly send | Confirm Listmonk list (FD-5) before promising cadence |

## 13. Open founder decisions (default shown)

| ID | Decision | Default |
|---|---|---|
| FD-1 | Amend D-29/D-30 to add `/ai-models/tracker`, `/watch`, `/watch/[date]`, `/leaderboards`, and `/insights` (record as new decision) | Yes, on the strength of the 2026-10-16 directive |
| FD-2 | Open a per-model leaderboard, band or composite | **Not yet.** Revisit only when all section 10 conditions hold. |
| FD-3 | Blog route name | `/insights` |
| FD-4 | Weekly cadence automation: scheduler registration and unattended commits | Not yet; manual approval per edition |
| FD-5 | Weekly email list and send process (Listmonk list, sending cadence) | Create list tagged by source; no cadence promise until confirmed |
| FD-6 | Paid concepts in section 7: build, price, create Gumroad products | Not yet; none linked |
| FD-7 | Providers view (`/ai-models/providers`) | Wait until the catalog has enough entries for it to add value beyond the tracker filter |
| FD-8 | Publish the "safety/welfare disclosure" block as provider-quoted facts | Yes, quoted and sourced only |
| FD-9 | Pre-release assessment for labs (independence review with counsel) | Not yet |
