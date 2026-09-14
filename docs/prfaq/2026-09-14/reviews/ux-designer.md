# UX Designer Review — CB-MODEL and Continuous Institutional Scoring
**Reviewer:** ux-designer agent
**Date:** 2026-09-14
**Lens:** user journeys and presentation of results

---

## 1. Scope

Routes and components read directly for this review:

- `site/src/app/ai-models/page.tsx`, `site/src/app/ai-models/methodology/page.tsx`
- `site/src/app/ai-evaluation-suite/page.tsx`, `site/src/components/model-benchmark/EvaluationScorer.tsx`, `site/src/components/model-benchmark/SubjectLine.tsx`
- `site/src/app/ai-labs/page.tsx` (grepped for cross-links; not read in full — page body is large and out of scope beyond the cross-link question)
- `site/src/components/index/RankingTable.tsx`
- `site/src/components/entity/renderEntityPage.tsx`, `site/src/components/entity/EntityDetail.tsx` (targeted sections), `site/src/components/entity/HistoryTimeline.tsx` (grep only)
- `site/src/app/company/[slug]/page.tsx` (thin wrapper over `renderEntityPage`)
- `site/src/components/layout/NavbarSearch.tsx`
- `site/src/components/updates/DailyBriefing.tsx` (full — 2083 lines, read in two passes; second half not re-read in detail, but section order and completion-block wiring confirmed)
- `site/src/app/score-watch/page.tsx` (partial), `site/src/app/purchase-research/page.tsx` (partial)
- `site/src/data/nav.ts`, `site/src/data/entity-identifiers.json`, `site/src/data/entity-records/cabo-verde.json`, `site/src/data/entity-records/democratic-republic-of-c.json`
- `nginx.conf`, `nginx-ssl.conf` (redirect rules)
- `.benchmark-ops/CURRENT_STATE.md`, `docs/UX_FLOWS_MODEL_BENCHMARK.md`, `research/UX_CANDIDATES_2026-04-18.md`, `research/UX_REVIEW_UPDATES_2026-05-19.md` (prior UX work, used to check what shipped vs. what was only proposed)

Not read in this pass (flagged so it isn't mistaken for "checked and clean"): `/indexes/page.tsx` body, `/certified-assessments`, `/advisory`, `/enterprise`, the second half of `DailyBriefing.tsx`'s sub-components (`ScoreMovementDashboard`, `SignalStack`, `EvidenceLedger` internals), `research/change-proposals/**` (relevant to "filed-not-applied proposals" — could not verify how or whether these render on any public page in the time available).

**Correction to the task brief, verified against current code (important for the PR/FAQ team to know before drafting):** the brief describes `/ai-evaluation-suite` as advertising "Set model name," composite scoring, JSON/CSV export, and a scorecard it does not implement (`WQ-P0-03` in `.benchmark-ops/CURRENT_STATE.md`, last updated 2026-09-07). Reading `site/src/components/model-benchmark/EvaluationScorer.tsx` today shows this is **no longer true** — the page is a fully wired client component with real per-item 1–5 scoring, a live composite (including a deliberate "composite withheld" state for AI-judge-mode runs and incomplete coverage), and working JSON/CSV/scorecard export. `.benchmark-ops/CURRENT_STATE.md` is stale on this specific point and should not be cited as current in the PR/FAQ without a caveat. I did not re-verify build/test status — only that the component code implements the claimed behavior.

---

## 2. Journey table

| Journey | Steps | Friction / dead ends | Severity | File evidence |
|---|---|---|---|---|
| (a) Reader lands on entity page from search | Search engine or on-site search → entity detail page → score, band, rank, recent findings, history link | Entity detail pages are well-built (floor designation, cohort peers, rank neighbours, history link, FAQ). But on-site search (`NavbarSearch`) and entity lookup (`getEntityBySlug`) match only the current canonical `name` string — no alias/former-name field exists on entity records. A reader searching "DR Congo" (record name is "Democratic Republic of the Congo") or "Cape Verde" (record renamed to "Cabo Verde") gets a bare "No entities found for…" with no hint the entity exists under another name. Direct URL navigation to `/country/cape-verde` *is* handled (nginx 301 to `/country/cabo-verde`), so only the search-box path is affected. | Medium | `site/src/components/layout/NavbarSearch.tsx:125-136` (substring match on `e.name` only); `site/src/data/entity-records/democratic-republic-of-c.json:5`; `nginx-ssl.conf:119-120` (URL redirect exists, search alias does not) |
| (a) continued — floor / zero scores | Reader reaches an entity whose composite resolves to 0.0 | Handled well: a dedicated, styled "Floor designation" disclosure block explains the methodology basis, primary drivers, evidence window, and exit conditions — explicitly never a silent zero. No friction found. | None (positive finding) | `site/src/components/entity/EntityDetail.tsx:735-846` |
| (b) Subscriber reads a daily briefing → follows to entities | Email/RSS → `/updates/[date]` → score-change cards, lead signal, evidence ledger → entity pages → purchase/subscribe CTA | Prior UX audits (`research/UX_CANDIDATES_2026-04-18.md`, `research/UX_REVIEW_UPDATES_2026-05-19.md`) flagged missing entity links, misplaced newsletter CTA, and no report-content preview. Current code shows these were substantially addressed: score-change cards link directly to entity detail pages via `entityHref()`, a consolidated purchase CTA sits at the end with an independence disclosure, and the newsletter ask lives inside `CompletionBlock` rather than being duplicated. No first-pass dead end found in the sections reviewed. | Low | `site/src/components/updates/DailyBriefing.tsx:966-1000` (`TrackedEntityLink` to `href`), `:853-883` (consolidated purchase CTA) |
| (c) Professional buys research or subscribes to Score-Watch | `/score-watch` hero → `/indexes#pick-entity-to-watch` or entity page → per-entity subscribe; `/purchase-research` → index report card → Gumroad | Wiring confirmed present (`SCORE_WATCH` references found in both `/indexes` and `EntityDetail.tsx`); not traced end-to-end into the Gumroad checkout itself. `RankingTable`'s search box still does not read a `?search=` URL param (a gap the April audit flagged), but this is now largely moot because briefing cards link straight to entity pages rather than to a pre-filled ranking-table search. | Low | `site/src/components/index/RankingTable.tsx:79` (`useState("")`, no `useSearchParams`); `site/src/app/score-watch/page.tsx:37-39` |
| (d) AI lab / researcher visits `/ai-models` | Nav → `/ai-models` (pre-registration, honest zero-model state) → `/ai-models/methodology` → wants to try scoring something themselves | **No cross-link exists in either direction between `/ai-models` (the official, pre-registration Model Index) and `/ai-evaluation-suite` (the functioning self-serve scoring tool).** A researcher reading the honest "no model has been scored yet" page has no path to the one thing on the site that actually lets them score a model today, and a visitor who finds the self-serve tool (buried in the footer "tools" list, not in main nav) has no way to learn the official Model Index program exists. This is the exact cross-link `docs/UX_FLOWS_MODEL_BENCHMARK.md` §1.5 and §11 item 8 called for and flagged as not-yet-built; it is still not built. | High | Confirmed by grep: `ai-models/page.tsx` and `ai-models/methodology/page.tsx` contain no reference to `ai-evaluation-suite`; `ai-evaluation-suite/page.tsx` and `EvaluationScorer.tsx` contain no reference to `ai-models`. Footer placement: `site/src/data/nav.ts:45-49` (`tools` list only) vs. main nav `site/src/data/nav.ts:3-12` (`/ai-models` present, `/ai-evaluation-suite` absent) |
| (d) continued — AI Labs Index vs. Model Index separation | Visitor reaches `/ai-labs` (organisation governance) via search, wants to know if a model behavior score exists too | `/ai-models` links to `/ai-labs` and states the distinction plainly (`SubjectLine`, the "Three Objects" table, and an explicit FAQ answer). `/ai-labs` does **not** reciprocally link to `/ai-models`. Partially mitigated by `/ai-models` being its own top-level main-nav item, so a visitor who checks the nav will find it regardless of which page they land on first — but a visitor who never opens the nav (common on a page reached via a search-engine deep link) has no on-page signal from `/ai-labs` that a separate, model-behavior score exists. | Medium | `site/src/app/ai-models/page.tsx:108-198` (links out, Three Objects table); grep of `ai-labs/page.tsx` for `ai-models`/`Model Index` returned no matches |
| (d) continued — BYO clipboard scoring, no composite emitted | User pastes a model response, scores it, exports | Extremely well-disclosed: every export (JSON/CSV/scorecard) carries an explicit unofficial/self-serve watermark; AI-judge-mode runs are structurally prevented from ever producing a composite (`hasAnyAiJudgeScore` forces `status: "incomplete"`); self-grading and prompt-injection heuristics are computed locally and never trusted from pasted input. No misleading affordance found here. | None (positive finding) | `site/src/components/model-benchmark/EvaluationScorer.tsx:645-670`, `:118-133` |
| (d) continued — release-watch section | Visitor scrolls `/ai-models#release-watch` | Honest, carefully worded: explicitly states tracking ≠ evaluating, states "no denominator here," and states the current scan count is real data read at build time, not hardcoded copy. No dead end found. | None (positive finding) | `site/src/app/ai-models/page.tsx:259-322` |

---

## 3. Findings

**HIGH — No cross-link between `/ai-models` (official Model Index) and `/ai-evaluation-suite` (working self-serve tool), in either direction.**
`site/src/app/ai-models/page.tsx` (full file, no mention of `/ai-evaluation-suite`); `site/src/app/ai-models/methodology/page.tsx` (same); `site/src/app/ai-evaluation-suite/page.tsx` (no mention of `/ai-models`); `site/src/components/model-benchmark/EvaluationScorer.tsx` (same). This is journey (d)'s single most consequential dead end: the page that honestly says "no model has been scored yet" sits right next to a page that lets a visitor score one right now, and neither knows the other exists. `docs/UX_FLOWS_MODEL_BENCHMARK.md` §1.5 specified this exact cross-link as a required (if small) handoff item; it was not implemented. Damages trust indirectly — not by misleading anyone, but by making the site's most functional AI-model-scoring capability nearly undiscoverable from the page built to introduce the topic.

**MEDIUM — `/ai-evaluation-suite` is not in main navigation; only reachable via footer "tools" list.**
`site/src/data/nav.ts:3-12` (main nav: Indexes, AI Models, Updates, Methodology, Research, Services, About, Contact — no evaluation suite) vs. `:45-49` (footer `tools` array). Compounds the finding above: a visitor exploring the primary nav for "somewhere to try this myself" will not find it without scrolling to the footer.

**MEDIUM — `/ai-labs` does not link to `/ai-models`, though `/ai-models` links to `/ai-labs`.**
Grep of `site/src/app/ai-labs/page.tsx` for `ai-models`/`Model Index`/`SubjectLine`/`ProductScope` returned no matches. The separation device (`SubjectLine`, the Three Objects table) exists only on the Model Index side. A reader who lands on `/ai-labs` first — plausible, since it is the older, more established page — gets no on-page signal that a separate, model-behavior-level score exists elsewhere. Mitigated but not eliminated by `/ai-models` being a top-level nav item.

**MEDIUM — On-site search has no alias/former-name support; renamed entities are unreachable by their old or common name via the search box.**
`site/src/components/layout/NavbarSearch.tsx:125-136` matches only `e.name.toLowerCase().includes(q)`; `site/src/data/entity-records/democratic-republic-of-c.json:5` (`"name": "Democratic Republic of the Congo"` — no `aliases` field found on the record); `site/src/data/entity-records/cabo-verde.json` similarly has no alias field. Direct URL navigation to the old Cape Verde slug is redirected server-side (`nginx-ssl.conf:119-120`), so this only affects the in-page search box, not inbound links — but "DR Congo" is a very common way to refer to that country and will silently fail with a generic "No entities found" rather than "did you mean Democratic Republic of the Congo?"

**LOW — `RankingTable` search state does not read `?search=` from the URL.**
`site/src/components/index/RankingTable.tsx:79` initializes from `useState("")`, not `useSearchParams`. Originally flagged in `research/UX_CANDIDATES_2026-04-18.md` Candidate 1 as blocking a briefing-card-to-ranking-page deep link. Now largely moot: `DailyBriefing.tsx` links score-change cards directly to entity detail pages (`entityHref()`), bypassing the need for a pre-filled ranking-table search — but if any future surface still intends to link into a ranking table with a pre-filled query, this gap remains real.

**LOW / POSITIVE — Floor designation (composite 0.0) has a purpose-built, non-silent disclosure UI.**
`site/src/components/entity/EntityDetail.tsx:735-846`. Explicitly states "never a silent zero," names the methodology version, primary drivers, evidence window, and exit condition. This is a genuinely strong pattern other zero/withheld states on the site should match.

**LOW / POSITIVE — Model Index empty state is disciplined and matches its own design doc.**
`site/src/app/ai-models/page.tsx` states the zero-model count in the answer-first strip and in Stat components rather than hiding it, includes an explicit "what would prove this method wrong" falsification section, and gates all JSON-LD on `F.hasResults` per `DECISIONS.md` D-29 (comment at `ai-models/page.tsx:16`). No countdown, no "coming soon," no fabricated urgency — matches `docs/UX_FLOWS_MODEL_BENCHMARK.md` §3.5 non-goals closely even though that doc targeted a different route (`/model-index`) than what shipped (`/ai-models`).

**UNVERIFIED (flagged, not asserted) — "withheld findings" and "filed-not-applied proposals" states.**
I could not find UI handling for these specific terms in `EntityDetail.tsx` or `HistoryTimeline.tsx` in the time available, and did not read `research/change-proposals/**` or the history-event renderer in enough depth to state how (or whether) a "proposed but not yet applied" change is distinguished from an applied one on a public page. This is a real gap in my review, not a finding of a defect — recommend QA/frontend-engineer confirm directly rather than treating its absence from this review as either a pass or a fail.

**UNVERIFIED — 13-day catch-up briefing rendering.**
`DailyBriefing.tsx`'s jump nav, "today in 30 seconds" tier, and section-presence logic were read and appear robust to sparse/empty sections, but I did not locate or read a briefing JSON fixture spanning a 13-day catch-up gap to confirm the header, date-nav, and pipeline-stat copy read sensibly for that specific case rather than implying a single overnight cycle. Flag for QA, not a confirmed defect.

---

## 4. Top 5 recommended improvements

### 1. Cross-link `/ai-models` and `/ai-evaluation-suite` in both directions
- **Type:** UX fix (navigation/content)
- **Problem:** The site's honest "no model scored yet" page and its one working model-scoring tool don't know about each other. A motivated visitor in journey (d) — the exact audience the Model Index exists to serve — hits a dead end at the moment of highest intent.
- **Expected benefit:** Converts an interested-but-stuck visitor into either a self-serve trial (retention/engagement) or an informed subscriber to the official program (the reverse direction). Removes an internal inconsistency a careful reader (e.g., a safety researcher, exactly the audience most likely to compare pages) would notice and lose trust over.
- **Evidence:** `site/src/app/ai-models/page.tsx` (no mention of evaluation suite anywhere in the file); `site/src/app/ai-evaluation-suite/page.tsx` (no mention of `/ai-models`); design intent already documented and unbuilt at `docs/UX_FLOWS_MODEL_BENCHMARK.md` §1.5, §11 item 8.
- **Impact:** 5 — directly serves the primary audience this PR/FAQ is about.
- **Strategic alignment:** 5 — CB-MODEL is the flagship initiative under review.
- **Learning value:** 2 — no new instrumentation needed beyond a link-click event, which likely already exists via `trackEvent`.
- **Confidence:** 5 — this is a link-and-a-paragraph change, not a new component.
- **Effort:** 1 — one card/callout on each page.
- **Risk:** 1 — must word the `/ai-models` → tool link so it doesn't look like the tool *is* the Model Index (reuse the "self-serve, unofficial, single-rater" framing already used inside `EvaluationScorer.tsx`'s own disclaimer, and already specified almost verbatim in `docs/UX_FLOWS_MODEL_BENCHMARK.md` §1.5).
- **Priority score:** 5+5+2+5−1−1 = **15**

### 2. Add "AI Evaluation Suite" to main navigation (or add it as a labelled sub-link under "AI Models")
- **Type:** Navigation
- **Problem:** The only working, hands-on AI-scoring feature on the entire site is discoverable solely via the footer's "tools" list.
- **Expected benefit:** Meaningfully more traffic to a fully-built, well-disclosed feature that currently has no main-nav discovery path.
- **Evidence:** `site/src/data/nav.ts:3-12` (main nav) vs. `:45-49` (footer only).
- **Impact:** 4
- **Strategic alignment:** 4
- **Learning value:** 2
- **Confidence:** 4
- **Effort:** 1
- **Risk:** 2 — must not visually imply the tool is an institutional index peer to Indexes/AI Models; nesting it as a labelled child of "AI Models" (not its own top-level item) avoids this.
- **Priority score:** 4+4+2+4−1−2 = **11**

### 3. Add a reciprocal "Model Index" pointer on `/ai-labs`
- **Type:** UX fix (content/navigation)
- **Problem:** The Three Objects disambiguation (`SubjectLine`, the change table) exists only on the Model Index side. A visitor who lands on `/ai-labs` first gets no on-page cue that a separate model-behavior score exists.
- **Expected benefit:** Reduces the risk of a reader conflating an organization's governance score with a model's behavior score — the exact conflation the whole product-separation effort (`DECISIONS.md` D-23, D-29, the product-separation guard) exists to prevent — and does so at the point where a reader arriving from search is most likely to form that wrong impression first.
- **Evidence:** grep of `ai-labs/page.tsx` for `ai-models`/`Model Index` — no matches.
- **Impact:** 4
- **Strategic alignment:** 5 — directly serves the product-separation requirement called out repeatedly in `.benchmark-ops/CURRENT_STATE.md` and `docs/UX_FLOWS_MODEL_BENCHMARK.md`.
- **Learning value:** 2
- **Confidence:** 4
- **Effort:** 1 — reuse `SubjectLine`-style copy, don't build new content.
- **Risk:** 1
- **Priority score:** 4+5+2+4−1−1 = **13**

### 4. Add a lightweight alias/former-name search fallback for renamed entities
- **Type:** Search/UX fix
- **Problem:** "Cape Verde" and "DR Congo" (and any future renamed entity) are unreachable via the on-site search box even though the entity exists under its current name, and the failure looks identical to "this entity was never scored."
- **Expected benefit:** Removes a specific, named-in-brief trust risk: a reader who can't find a country they know is covered may conclude the benchmark's coverage is incomplete or the tool is broken, when the actual answer is a rename.
- **Evidence:** `site/src/components/layout/NavbarSearch.tsx:125-136`; `site/src/data/entity-records/democratic-republic-of-c.json:5`; `site/src/data/entity-records/cabo-verde.json` (no alias field on either record); redirect exists only at the nginx URL level (`nginx-ssl.conf:119-120`), not in search data.
- **Impact:** 3 — affects a small number of named entities, but those are the exact ones flagged as likely to be hit.
- **Strategic alignment:** 3
- **Learning value:** 2
- **Confidence:** 4
- **Effort:** 2 — needs a small `aliases: string[]` field added to two (or more) entity records plus a one-line change to the search filter predicate; not a new system.
- **Risk:** 1
- **Priority score:** 3+3+2+4−2−1 = **9**

### 5. Retire or correct the `.benchmark-ops/CURRENT_STATE.md` `WQ-P0-03` entry
- **Type:** Documentation/process fix (not user-facing, but directly affects what this PR/FAQ and future agents believe about the product)
- **Problem:** The ops ledger still lists `/ai-evaluation-suite` as advertising capabilities it doesn't implement. That is no longer true — the page is fully functional, well-disclosed, and arguably one of the strongest-executed surfaces on the site. Leaving this stale creates a real risk: a future agent (or this PR/FAQ) could describe a working, trust-building feature as a defect, which is itself a trust problem in the other direction.
- **Expected benefit:** Prevents future agents/writers from citing a fixed defect as current, and frees `/ai-evaluation-suite` to be used as a positive proof point ("we publish the method and let you try it yourself") rather than an apologized-for gap.
- **Evidence:** `.benchmark-ops/CURRENT_STATE.md` lines 47-63 (`Broken` table, `WQ-P0-03` row) vs. `site/src/components/model-benchmark/EvaluationScorer.tsx` (full file — working state, notes, export, disclosures).
- **Impact:** 3 — indirect, but affects every downstream agent's accuracy.
- **Strategic alignment:** 3
- **Learning value:** 3 — an explicit "verify current code state" instruction was needed to catch this; worth a process note about ledger staleness.
- **Confidence:** 5 — I read the actual component; the functionality is there.
- **Effort:** 1 — a status update, not a rebuild.
- **Risk:** 1
- **Priority score:** 3+3+3+5−1−1 = **12**

---

## 5. PR/FAQ inputs

### Customer experience described honestly today
A reader arrives — from a search engine, a shared briefing link, or the main nav — and can, within one click, understand what Compassion Benchmark measures and how confident to be in what they're looking at. On the institutional side (governments, corporations, AI labs, robotics labs), that experience is mature: entity pages show composite, band, rank, dimension breakdown, peers, and history, and a zero score renders as a labelled "floor designation" with a stated evidence basis rather than a silent number. On the AI model side, the experience today is a **published method with no results**: `/ai-models` states plainly, in the eyebrow, the stats row, and the FAQ, that zero models have been scored, while `/ai-evaluation-suite` lets any visitor score a model themselves right now, fully labelled as unofficial and self-reported. The one meaningful gap is that these two AI-model surfaces don't point at each other, so a visitor's journey through "the AI model story" currently has a hole in the middle rather than a defect at either end.

### Customer experience at first model result
Once a model result publishes, the honest "0 models scored" framing on `/ai-models` should flip to a real citable finding (composite, band, snapshot identity) without any change to the surrounding trust architecture — the same Three Objects table, the same falsification-conditions callout, the same "no entity pays" disclosure should carry forward unchanged. The open design question this review did not need to resolve (out of scope, and per `docs/UX_FLOWS_MODEL_BENCHMARK.md` §6, a real product decision) is how the comparison view behaves at N=1 vs. N≥3 — that document's recommendation (no false "#1 of 1," a spotlight card rather than a table at N=1) is sound and, as far as this review could determine, not yet built because no result exists to build it against.

### Hard FAQ questions and honest answers

1. **"If your AI model benchmark has evaluated zero models, why does it exist as a public page at all?"**
   Honest answer: because the method, the task bank, and the conditions under which the method should be judged to have failed are published in advance of any result, on purpose — so the instrument can be checked before it produces a number that could be shaped to fit. This is a real, and current, page (`/ai-models`), not a placeholder; it states its own zero count in four visible places rather than hiding it.

2. **"You have a fully working AI-scoring tool (`/ai-evaluation-suite`) sitting right next to a page that says no model has been scored — why don't they connect?"**
   Honest answer: they should, and don't yet. This review found no cross-link in either direction and recommends adding one (see §4, item 1) before or alongside this launch, since it is the single most visible inconsistency between the two AI-model surfaces.

3. **"Does your AI Labs score tell me anything about how a specific model behaves?"**
   Honest answer, and the site already gives it correctly: no. `/ai-models` states this explicitly with a worked "change test" table (e.g., "the lab dissolves its safety team" moves the AI Labs Index only; "a new model version answers a distress prompt worse" moves the Model Index only). The one gap is that this explanation currently lives only on the Model Index side — `/ai-labs` itself doesn't yet point back (§3, §4 item 3).

4. **"Since your task bank is fully public with its answer key, isn't your self-serve tool's composite meaningless?"**
   Honest answer, and again the site already says so unprompted: yes, for cross-model comparison — which is exactly why `EvaluationScorer.tsx` withholds any 0-100 composite for AI-judge-mode runs and labels every export as a single-rater, self-reported, unofficial result. This is disclosed at the point of use, not buried in a footnote.

5. **"A reader searches for a country by a name they know it by and gets 'no results' — does that mean it isn't covered?"**
   Honest answer: no, but the product doesn't currently say so. Two known cases (Cabo Verde, formerly listed as Cape Verde; Democratic Republic of the Congo, commonly called DR Congo) are fully covered and correctly redirect at the URL level, but the on-site search box has no alias awareness and will return a generic "no results" for the old or common name. This is a real, fixable gap (§4, item 4), not a coverage gap.

---

Files most relevant to a follow-up pass: `site/src/app/ai-models/page.tsx`, `site/src/app/ai-models/methodology/page.tsx`, `site/src/app/ai-evaluation-suite/page.tsx`, `site/src/components/model-benchmark/EvaluationScorer.tsx`, `site/src/components/model-benchmark/SubjectLine.tsx`, `site/src/app/ai-labs/page.tsx`, `site/src/data/nav.ts`, `site/src/components/layout/NavbarSearch.tsx`, `site/src/components/entity/EntityDetail.tsx`, `site/src/components/entity/renderEntityPage.tsx`, `site/src/components/updates/DailyBriefing.tsx`, `.benchmark-ops/CURRENT_STATE.md`.
