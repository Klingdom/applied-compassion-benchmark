# Content Strategy Review — Site-Wide IA & Information Value
**Date:** 2026-06-10  
**Scope:** All 45 routes under site/src/app/**  
**Lens:** Page-level job-to-be-done, content model, cross-page IA  
**Constraint:** Complements the existing /updates Round-2 backlog (docs/UPDATES_BACKLOG2_2026-06-10.md); does not repeat it

---

## Scoring key
Impact · Strategic Alignment · Learning Value · Confidence: 1–5 (higher = better)  
Effort · Risk: 1–5 (higher = worse)  
**Priority = (Impact + Strategic Alignment + Learning Value + Confidence) − Effort − Risk**

---

## Candidate 1 — Stat-of-the-Day is a hero element on a dense briefing; demote or remove

**Page(s):** `/updates` → `DailyBriefing.tsx` → `briefing/StatOfTheDay.tsx`

**Problem (evidence):**  
`StatOfTheDay.tsx` renders a `clamp(2rem,5vw,3rem)` font-size number block with a label, entity link, and copy-citation button inside a full-width bordered card (line 48). The founder has explicitly flagged it as "too big / wasting space." It appears above the fold on most screens, ahead of the briefing's actual editorial content (the lead signal, score movements, sector findings). A card that exists to surface a single number — often a coverage stat like "1,160 entities scanned" — is the lowest-information element on the page but occupies the highest-attention position.

The `DailyBriefing.tsx` layout order is: DailyBriefingHeader → OpeningQuestion → LeadSignalCard → StatOfTheDay → ForwardTriggerCountdown → SignalStack → ScoreMovementDashboard. The stat card is wedged between the lead signal and the forward-watch item — both of which carry genuinely time-sensitive editorial value.

**Proposed change:**  
Remove StatOfTheDay from the briefing layout entirely. If a pipeline-coverage summary is needed for credibility, surface it as a one-line metadata row inside `DailyBriefingHeader` (already exists as `pipelineEntitiesScanned` et al. on the home page). The citation-copy affordance (the only truly useful behavior here) should be moved to individual score-change cards.

**Information/product value:**  
Removes a space-tax element, tightens above-the-fold density, and removes an element that teaches nothing new to a returning reader. Every pixel reclaimed here goes to LeadSignalCard and ForwardTriggerCountdown, which carry the actual editorial weight.

**Independence check:** PASS — no scoring implications.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 3 | 2 | 5 | 1 | 1 | **12** |

---

## Candidate 2 — /research page is a near-duplicate of /indexes with stale stats

**Page(s):** `/research` (`site/src/app/research/page.tsx`)

**Problem (evidence):**  
The `/research` page shows `Stat value="780+"` for entities benchmarked (line 30 of research/page.tsx); the live count is 1,155 (confirmed across home page, indexes page, methodology page, and daily briefing pipeline data). The index coverage listed is also incomplete — only 5 of 7 index families are shown. The page then lists "Future Research Outputs" (Annual Benchmark Reports — "In progress"; Sector Research Briefs — "Planned"; Longitudinal Analysis — "Planned") without dates, owners, or success conditions.

The page's job is undefined. It is not where users go to browse rankings (that is `/indexes`). It is not a methodology document (that is `/methodology`). It is not a commercial hub (that is `/purchase-research`). The three-panel "Research Program Focus" section (Comparative Institutional Analysis, Dimension-Level Diagnostics, Technology Governance) is abstract description that repeats what `/methodology` already covers in concrete detail.

The home page, `/indexes`, and `/about` all link to `/research` as if it adds a distinct layer. In practice, a user clicking through lands on a page that gives them less information than the page they came from.

**Proposed change:**  
Option A (preferred): Repurpose `/research` as the **Research Pipeline Status page** — the live interface between the benchmark's ongoing work and visitors who want to understand what is in-progress, what methodology rulings have been applied, and what the forward-watch outlook looks like. Content model: (a) link to `/updates` as the primary daily interface, (b) link to `/updates/forward-watch` as the Scoring Outlook ledger, (c) an accurate "Research scope" block drawn from the same source-of-truth as the indexes page, (d) a lightweight summary of the methodology changelog (link to `/methodology#changelog`). Remove "Future Research Outputs" table entirely — it is not credible as an undated wish-list.

Option B (lower effort): Redirect `/research` to `/indexes` and remove the nav link.

**Information/product value:**  
Eliminates a stale, duplicative page. Option A converts it into a linking hub that creates the missing explicit connection between the continuous research pipeline (`/updates`) and the formal methodology (`/methodology`) — a connection that currently exists only in prose on the methodology page.

**Independence check:** PASS.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 3 | 4 | 2 | 5 | 2 | 1 | **11** |

---

## Candidate 3 — Entity pages lack a direct link to today's briefing when the entity appears in it

**Page(s):** `site/src/components/entity/EntityDetail.tsx`; `site/src/components/entity/EntityEvidenceCard.tsx`

**Problem (evidence):**  
`EntityDetail.tsx` already surfaces the evidence freshness stamp (line 155–183) and the `EntityEvidenceCard` (line 185–190), which shows the most recent score change and history. But there is no forward link from an entity page to the daily briefing entry that produced or confirmed that change. The `latestChange` object carries a `date` field (see `EntityScoreChange` interface, line 18), which maps directly to a briefing at `/updates/[date]`. The score-change card shows the date but does not link it to the source briefing.

This is a broken information chain. A user who arrives at the UAE entity page after the June 8 band crossing sees a score change dated 2026-06-08 but has no path from that card to the full evidence ledger in the June 8 briefing without navigating independently. The `/updates` → entity page link works (TrackedEntityLink.tsx, evidenceCardProps.historyHref); the entity page → `/updates/[date]` link does not exist.

**Proposed change:**  
Add a "Source briefing" link to the evidence card header: "View full briefing — [date]" → `/updates/[date]`. This is a data-model change only (the date is already present in `latestChange.date`) and requires a single link addition to `EntityEvidenceCard`. Secondarily, any forward-watch trigger for this entity that appears in `/updates/forward-watch` should be surfaced with a one-line "Under active forward watch" indicator + link, using the same `forwardTriggers` data the briefing already emits.

**Information/product value:**  
Closes the entity → briefing feedback loop. A reader of the UAE page after a band crossing can follow the evidence chain from the score card directly to the full methodology reasoning in the briefing. This is the core information architecture promise of the site: the public record of a score change is not just the number, it is the reasoning, and right now the reasoning is only accessible if the visitor independently navigates to `/updates`.

**Independence check:** PASS — strengthens the auditable evidence chain rather than obscuring it.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 5 | 4 | 5 | 2 | 1 | **15** |

---

## Candidate 4 — The /indexes page explains its own revenue model to itself; cut three internal-only sections

**Page(s):** `/indexes` (`site/src/app/indexes/page.tsx`)

**Problem (evidence):**  
`/indexes/page.tsx` contains: (a) a "Monetization model for the indexes" panel (lines 183–206), (b) an "Index buyer paths" table with four-column routing logic (lines 238–273), and (c) a "Recommended calls to action from index pages" panel (lines 278–288) that tells the reader what index pages *should* say, not what *this* page says. These are internal product-strategy notes hardcoded as public page content.

A journalist, researcher, or executive arriving at `/indexes` to browse rankings does not need to read a four-column table explaining that "Institutional analysts" should go to "Data License" for "Institutional analysts' need for structured use of benchmark data." They need to find the index they want and understand what more they can get. The page is currently ~295 lines of rendered content; roughly 80 of those lines (about 27%) are internal routing rationale that the visitor cannot use.

**Proposed change:**  
Remove the "Monetization model for the indexes" panel, the "Index buyer paths" table, and the "Recommended calls to action from index pages" panel from the public `/indexes` page. Consolidate the commercial call-to-action into a single, clean "Go deeper" block (already present as the "Go deeper with benchmark products" section, lines 209–235). The buyer-path logic should inform the IA of other pages (entity detail, score-watch), not appear as visible table content on the indexes hub.

**Information/product value:**  
Reduces page length by ~27%, removes content that a real visitor cannot use, and sharpens the indexes page's actual job: help the visitor find the right index, understand coverage, and navigate to a commercial product if they want one.

**Independence check:** PASS.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 3 | 3 | 2 | 5 | 1 | 1 | **11** |

---

## Candidate 5 — /updates has no persistent link to /updates/forward-watch from the briefing itself

**Page(s):** `/updates` (`DailyBriefing.tsx`), `/updates/forward-watch`

**Problem (evidence):**  
`/updates/forward-watch` is the Scoring Outlook ledger — the accountability moat item ranked #2 in the Round-2 backlog. It is already built and deployed. But it is not linked from the briefing body. The only navigation path to it is: (1) the archive discovery link at the top of `/updates/page.tsx` ("Browse all N briefings"), (2) typing the URL directly, or (3) clicking the `ForwardTriggerCountdown` component inside a daily briefing that happens to have open triggers.

The `ForwardTriggerCountdown` component renders a countdown for current-day triggers but does not include a persistent "View all open triggers →" link to `/updates/forward-watch`. A visitor who reads the briefing and sees Oracle's June 15 deadline has no obvious path to "show me all active forward triggers across all entities."

**Proposed change:**  
Add a persistent "View Scoring Outlook →" footer link inside `ForwardTriggerCountdown` (always visible, not conditional on triggers being present for today). Additionally, add `/updates/forward-watch` as a secondary nav item under the `/updates` date tabs — the same bar that currently shows "Browse all N briefings" — so it appears on every briefing date, not only when today's briefing has triggers.

**Information/product value:**  
Makes the forward-watch accountability moat discoverable from its natural context (the daily briefing). The ledger currently exists but is invisible unless the visitor already knows about it. Discoverable accountability content is the entire point of the moat.

**Independence check:** PASS — the ledger actively reinforces independence by making the benchmark's own calls publicly falsifiable.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 5 | 4 | 5 | 1 | 1 | **16** |

---

## Candidate 6 — /score-watch page is disconnected from /updates; misses the strongest acquisition argument

**Page(s):** `/score-watch` (`site/src/app/score-watch/page.tsx`)

**Problem (evidence):**  
The `/score-watch` page describes the product accurately but does not use the most persuasive available evidence for why it matters. The daily briefing regularly surfaces band crossings (the UAE June 8 crossing is the first in several cycles) and forward triggers with specific deadlines (Oracle June 15 WARN sign-or-forfeit). These are concrete examples of exactly what Score-Watch delivers — "the morning after a change is confirmed."

The page currently has no link to `/updates` or to a recent band-crossing example. The "Investors and analysts" buyer card says "the signal lands before it's in the news cycle" but offers no evidence of that. The /updates briefing for June 8 is that evidence — a 5-point band crossing documented and published before most investors will have seen it in mainstream coverage.

**Proposed change:**  
Add a "Recent Score-Watch signals" block to `/score-watch` that pulls from `latest.json` (same import pattern as the home page, `page.tsx` lines 13–33) and renders the most recent score change (delta, entity, band change flag, date) with a link to the full briefing. This is a content-model change: the score-watch page becomes evidence-backed, not just description-backed. It teaches the value proposition by showing it, not by asserting it.

**Information/product value:**  
Converts an abstract product description into a live, evidence-backed demonstration. Uses data the site already generates daily. Directly addresses the "why now" objection a prospective subscriber faces. Also creates a new internal cross-link path: `/updates` → entity page → Score-Watch → `/updates` recent evidence.

**Independence check:** PASS — the score change shown is already public. Subscriber status is not revealed.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 4 | 3 | 4 | 2 | 1 | **12** |

---

## Candidate 7 — The home page "Today's research" section duplicates /updates without adding a reason to click through

**Page(s):** `/` (`site/src/app/page.tsx`, lines 123–196)

**Problem (evidence):**  
The home page renders up to two score-change cards and one highlight from `latest.json`. The score-change card shows entity name, index, delta, headline (truncated at 140 chars), and score movement. This is nearly identical to what a visitor sees if they navigate directly to `/updates`, except without the full briefing context. The two "View full briefing" CTAs (line 139 and line 193) are separated by only ~70 lines of code but point to the same destination.

The section's job is ambiguous: is it a preview (pull the visitor into `/updates`) or a summary (tell them what happened so they do not need to go to `/updates`)? If it is a preview, it needs a sharper hook — not a truncated headline but a tension or a question that requires the briefing to resolve. If it is a summary, it should include more entities and no CTA.

Additionally, the "Stat-of-the-Day" equivalent on the home page is the pipeline stats row (`pipelineEntitiesScanned · pipelineEntitiesAssessed · pipelineProposalsCount`) at line 135, which serves a similar low-information function: coverage numbers, not editorial findings.

**Proposed change:**  
Redefine the section's job as "pull to /updates." Replace the pipeline stats row with a one-line editorial summary drawn from `updates.headline` (already available, used in `/updates/page.tsx` OG tags). Replace truncated-headline cards with a single "Lead signal" entry that includes the delta, entity name, band-change indicator (if present), and a sharp 40-word excerpt from the headline — enough to create tension but not to resolve it. Single "Read today's briefing" CTA.

**Information/product value:**  
Sharpens the home page's relationship to `/updates`. Currently the section teaches nothing distinctive — a visitor who reads the two truncated cards and clicks away has seen close to nothing. A single compelling lead signal that raises a question and requires the briefing to answer it is higher-value in less space.

**Independence check:** PASS.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 4 | 3 | 4 | 2 | 1 | **12** |

---

## Candidate 8 — /about and /methodology share an independence-policy section verbatim; /about has no unique job

**Page(s):** `/about` (`site/src/app/about/page.tsx`), `/methodology` (`site/src/app/methodology/page.tsx`)

**Problem (evidence):**  
Both `/about` and `/methodology` contain an independence policy section. The `/methodology` version is the authoritative one (five detailed items with explanations, lines 323–364 of methodology/page.tsx). The `/about` version is a shorter list that repeats four of the same five points in less detail.

`/about` does not have a content job that `/methodology`, `/indexes`, and the home page do not already cover better. It describes the institution, explains the purpose, and lists the independence policy. All three of those functions are served more completely elsewhere:
- Institution description: home page hero + callout sections
- Purpose: home page "benchmark institution, not a campaign site" callout
- Independence: `/methodology` independence policy section

The `/about` page routes are linked from the nav (`nav.ts` presumably includes it) and from the `/score-watch` page (line 109: "See the independence policy"). That link goes to `/about` but the authoritative policy is in `/methodology#independence`. This is a broken information link.

**Proposed change:**  
Redefine `/about` as the **Institutional Transparency page** with three distinct content blocks that do not duplicate other pages: (1) the founder / editorial independence declaration (who makes scoring decisions, how the approval gate works — currently only in methodology prose), (2) a versioned list of methodology rulings applied this year (linking to `/methodology#changelog`), (3) a disclosure of any known conflicts (currently described as "if an advisory or editorial relationship exists, it is disclosed on that entity's page" — the about page is a natural home for the parent disclosure). Remove the duplicated independence bullet list. Update the `/score-watch` link to `/methodology#independence`.

**Information/product value:**  
Gives `/about` a unique job it currently lacks (institutional transparency record), and removes the independence policy duplication. The transparency record (founder approval gate, methodology rulings applied, conflict disclosure mechanism) is content that no other site page currently owns at page level.

**Independence check:** PASS — this strengthens rather than compromises independence by making the governance structure more explicitly visible.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 3 | 4 | 4 | 4 | 2 | 1 | **12** |

---

## Candidate 9 — Cross-site: score/band is displayed inconsistently across index pages, entity pages, and /updates

**Page(s):** All index ranking tables; entity heroes (`EntityDetail.tsx`); `ScoreMovementCard.tsx`; home page score-change cards

**Problem (evidence):**  
The score+band combination is the benchmark's primary unit of information, but it is rendered differently across contexts:
- Index ranking tables: score as number in a column, band in a separate "Band" column
- Entity hero (`EntityDetail.tsx` line 140–148): score in a large box (2.6rem), band as a `<Band>` component to the left
- Home page score-change cards: score shown as "from → to" with delta badge, band name only in a conditional "Band change:" line
- ScoreMovementDashboard in briefing: delta as large colored number, no band indicator unless band-change flag is set
- `StatOfTheDay` (to be removed per C1): number + label, no band

The band is the most legible unit for non-expert readers (Critical / Developing / Functional / Established / Exemplary). The score number is the precise unit for analysts. On fast-moving pages like `/updates`, band is often more salient (a band crossing is the headline event in the June 8 briefing) but appears only conditionally.

**Proposed change:**  
Define a canonical "score chip" content model: score number + band badge + optional delta (colored). Apply this chip consistently everywhere a score appears: index ranking table rows (band column replaced by inline chip), entity hero, briefing score-movement cards, home page preview cards. The `Band` component already exists (`site/src/components/ui/Band.tsx`). This is a content-model standardization, not new visual design.

**Information/product value:**  
A visitor who learns the five band levels on the methodology page should be able to instantly read band context everywhere on the site. Currently the band disappears from many contexts. Standardizing the chip makes the benchmark's own primary classification system consistently visible across every information surface.

**Independence check:** PASS.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 5 | 5 | 4 | 3 | 2 | **13** |

---

## IA coherence summary

The current information architecture path is approximately correct:

> home → indexes → entity detail → methodology → /updates → commercial

But four gaps undermine it:

1. **Entity → briefing link is broken** (Candidate 3). Score changes appear on entity pages with no path to the source reasoning in `/updates/[date]`.
2. **Forward-watch is built but undiscoverable** (Candidate 5). The accountability ledger exists at a URL that no high-traffic page links to.
3. **/updates accountability content is not reinforced by /methodology** (not yet a candidate above, but adjacent to C5 and C8). The methodology page links to `/updates` ("See every approved score change") but does not link to the forward-watch ledger, methodology changelog, or briefing archive. These are the live expressions of the methodology's core guarantees.
4. **The /research page is a dead node** (Candidate 2). It claims a position in the IA (between indexes and purchase) but delivers less than either endpoint.

---

## Highest-leverage information-strategy change

**Candidate 3** (entity pages link back to source briefing) at Priority 15 is the single highest-leverage IA fix because it completes the evidentiary chain the site promises. The score on an entity page is only as credible as the evidence behind it. That evidence lives in `/updates/[date]`. Right now a visitor can see the conclusion but cannot follow the link to the reasoning. Closing that gap takes one data-model observation (date is already present in `latestChange`) and one link addition to `EntityEvidenceCard`. No schema change, no new data, no new pipeline work — just a missing link in the existing information architecture.

**Candidate 5** (forward-watch link from briefing) at Priority 16 is a close second and is lower effort than Candidate 3 (one link addition to `ForwardTriggerCountdown`, one link addition to the date-nav bar). Its impact is conditional on the forward-watch ledger having content (it does), but its strategic value is unique: it makes the benchmark's own predictions public and falsifiable from within the main reading experience, which no competing publication does.

---

## Top 3 candidates ranked

| Rank | Candidate | Priority | One-line rationale |
|------|-----------|----------|--------------------|
| 1 | C5 — Forward-watch link from briefing | **16** | The accountability moat is built but invisible; one link from the briefing unlocks it for every reader. |
| 2 | C3 — Entity → source briefing link | **15** | The evidence chain from score to reasoning is broken at the most-visited content type (entity pages); one link closes it. |
| 3 | C9 — Canonical score chip across all surfaces | **13** | The benchmark's primary classification (band) disappears from half the surfaces where scores appear; standardizing the chip makes the framework legible everywhere at low implementation cost. |
