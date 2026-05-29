# UPDATES PAGE — PM REVIEW
**Date:** 2026-05-29
**Scope:** /updates, /updates/[date], /updates/archive — daily briefing product as a reader destination

---

## What Was Read

- CLAUDE.md
- site/src/app/updates/page.tsx, [date]/page.tsx, archive/page.tsx
- site/src/components/updates/DailyBriefing.tsx and all 14 sub-components under briefing/
- site/src/data/updates/daily/2026-05-29.json, 2026-05-28.json, 2026-05-26.json
- site/src/data/updates/manifest.json (30 dates, latest 2026-05-29)
- site/src/components/updates/ArchiveList.tsx
- .claude/agents/overnight-digest.md (PUBLIC DAILY JSON RULES)

---

## Overall Assessment

The briefing has world-class raw material: precise evidence, methodology rulings, boundary-watch proximity data, forward signals, sector analysis, and an opening question. The content is genuinely differentiated. The structural problems are almost entirely information architecture failures — the right content exists, but it is ordered, surfaced, and connected in ways that prevent it from becoming a daily habit.

Three structural problems dominate:

1. **The reader has no quick orientation.** The briefing starts with a full-size header, then 14+ sections of equal visual weight. There is no "here is what happened today in 30 seconds" surface before the long-form begins. Morning Brew, Axios AM, and Freedom House's daily digest all lead with a crisp 3-5 line summary before the detail. This briefing does not.

2. **The archive and the entity pages are disconnected from the briefing.** A reader who sees "Hungary upgraded +3.9pt on May 13" cannot one-click to Hungary's score history, and a reader on Hungary's entity page cannot see all the briefings that mentioned Hungary. The /updates archive has entity filtering, but it filters on topEntities only. Score-Watch exists as a separate subscription flow, not integrated into the briefing read path.

3. **The schema produces uneven quality across sections.** The 2026-05-29.json has excellent sector trends and insights sections (3-5 dense analytical paragraphs each) but the topSignals array is empty (SignalStack renders nothing), pipeline.entitiesScanned is 0, and many scoreChanges entries have empty headline and evidence fields. The sections that are richest (sectorTrends, insights, highlights, emergingRisks) are buried in position 11-12 of 17.

---

## Candidate Improvements

---

### 1. Today-in-Brief Module: 5-Line Scannable Summary at the Top

**Type:** New feature

**Problem:**
The briefing opens with a KPI grid (entities monitored, assessments, score changes, risk signals), a header date/thesis, and immediately proceeds to the full-detail opening question and lead signal card. There is no scannable 5-line summary of what happened today before the long-form begins. A busy reader opening /updates for 90 seconds gets no quick orientation.

Evidence from 2026-05-29.json: the `highlights` array (lines 1804-1810) contains 5 precisely written one-paragraph bullets on the J&J ruling, GENDER-APARTHEID category, Anthropic's Pentagon episode, Turkey's descent, and the humanitarian mega-crisis cluster. This content is exactly right for a quick summary, but it lives in section 14 of the page. The `insights` array (lines 1798-1803) has 4 paragraphs of analytical synthesis that is equally strong. Both are buried.

The digest agent's own framing instruction says "Be concise. Each section should be scannable. Use tables and bullet points. This is read over morning coffee." (overnight-digest.md line 188). The morning-coffee framing is built into the pipeline intent. The product surface does not honor it.

**Proposed change:**
Add a "Today in Brief" module between the header KPIs and the opening question. Source from `highlights[0..2]` and `emergingRisks[0]` (already in JSON). Three bullets: top finding of the day, top methodology event, top forward risk. Each bullet is one sentence with a link to the relevant section anchor. Total read time: 20 seconds.

This does not require any schema change. `highlights` and `emergingRisks` fields are already populated in every briefing.

**Reader value / why it drives daily return:**
Readers who have 2 minutes read the 3 bullets and leave satisfied. Readers who have 20 minutes read deeper. This is the same pattern that makes Axios AM and Morning Brew habitual — you always get the top line regardless of time. Without it, the briefing requires 10+ minutes to extract value, which is a high bar for a daily habit.

**Independence-policy check:** PASS. This surfaces existing evidence-grounded content. No entity receives promotional placement — the module reads from the same pipeline-generated arrays as the rest of the briefing.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **15** |

---

### 2. Entity-Briefing Backlink: Surface All Briefing Appearances on Entity Pages

**Type:** New feature

**Problem:**
The entity page (e.g., /country/turkey) shows the entity's current score, evidence record, and assessment history. It does not show which briefings mentioned the entity. A reader tracking Turkey across the May 24-29 arc cannot navigate from the entity page to the relevant briefings — they must use the /updates/archive entity filter, which only matches against `topEntities` in the ArchiveIndex (see ArchiveList.tsx line 541), not against the full scoreChanges or confirmations arrays.

Evidence: The 2026-05-29.json has Turkey appearing in scoreChanges (line 168), sectorTrends (line 1767), highlights (line 1808), and insights. The ArchiveIndex topEntities array (built at build time from archiveIndex.ts) may or may not capture all these appearances. The entity page component (EntityDetail.tsx per CLAUDE.md) has no section linking back to /updates.

This is a significant missed connection: entity pages are the logical "home" for an entity, and /updates is where fresh intelligence appears. Connecting them would increase both return visits to /updates (from entity page readers) and entity page depth (from briefing readers).

**Proposed change:**
At build time, when generating archive index entries, also write a per-entity briefing history: for each entity slug, a list of `{date, headline, delta}` objects covering all briefings where the entity appears in scoreChanges, confirmations, or topSignals. Surface this on entity pages as a "Recent briefings" section (last 5 appearances, link to full briefing). This is a static-export-compatible pattern — same pattern as `export-public-data.mjs` already uses for score data.

Schema cost: minor. A new `site/src/data/updates/entityBriefingIndex.json` generated at build time, keyed by entity slug.

**Reader value / why it drives daily return:**
Creates a clear discovery path: reader follows a news event about Turkey to the entity page, finds the last 5 briefing entries on Turkey, and clicks through to /updates. This is the "related content" loop that makes editorial products habitual. It also surfaces the benchmark's depth: "Turkey has appeared in 14 of the last 30 briefings" is itself a signal.

**Independence-policy check:** PASS. This is navigation infrastructure. It does not change scoring, prominence, or search placement based on anything other than pipeline-generated assessment records. No entity can pay to appear more frequently.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |
| **Priority Score** | **12** |

---

### 3. Section Order Restructuring: Analytical Sections Before Technical Detail

**Type:** Improvement

**Problem:**
The current section order (per DailyBriefing.tsx lines 174-328) is:
1. Header (good)
2. Opening question (good)
3. Lead signal (good)
4. Brutal insight (good)
5. High compassion contrast (good)
6. Today's analysis (good)
7. Signal stack (good, but frequently empty — topSignals is 0-length in 2026-05-29.json)
8. Score changes — FULL DETAIL CARDS (very long, technical)
9. Score movement dashboard
10. Boundary watch
11. Evidence ledger
12. **Sector findings** (high-value synthesis)
13. **Emerging risks** (high-value, forward-looking)
14. Methodology disclosures (technical)
15. Confirmations table (very long, technical)
16. Floor conduct, math hygiene, carry-forward credits (operational)
17. Holds, forward signals, analytical notes

The high-value analytical synthesis (sector trends, emerging risks, insights, highlights) is buried after the long score-change detail cards and technical tables. In 2026-05-29.json, sectorTrends has 3 dense analytical sections (lines 1763-1789) and emergingRisks has 6 forward-looking items (lines 1790-1797). These read like Bloomberg or Freedom House intelligence briefings. They currently appear at position 12-13, after 40+ score-change detail cards.

Evidence of the gap: the current briefing header CTA says "Read today's brief" and links to `#signals`. The signal stack itself may render null (topSignals empty in 2026-05-29.json, visible at line 4). A reader clicking "Read today's brief" may land on a blank section.

**Proposed change:**
Restructure to: Summary (proposal 1) → Opening question → Lead signal → Brutal insight → Sector analysis → Emerging risks → High compassion contrast → Today's analysis → Score changes → Boundary watch → Evidence ledger → Confirmations → Methodology disclosures → Technical tables.

No JSON schema change needed. No new data needed. Pure component reordering in DailyBriefing.tsx. Specifically: move SectorTrendsSection and EmergingRisksSection (currently at DailyBriefing.tsx lines 210-221) to positions 6-7, immediately after the editorial framing sections and before the score-change detail.

The principle: editorial synthesis before raw data. The benchmark's analytical output is its differentiator. Raw score-change cards are the evidence base; sector analysis is the intelligence product.

**Reader value / why it drives daily return:**
Readers want the "so what" before the "here is each data point." Moving the synthesis sections up respects the reader's time and matches how every world-class daily intelligence product is structured. Freedom House puts country analysis before raw data tables. Bloomberg Businessweek leads with narrative, not data appendices.

**Independence-policy check:** PASS. This is a display order change. It does not affect what is included, scored, or excluded.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **13** |

---

### 4. Evening Resolution Field: Close the Opening Question's Loop

**Type:** New feature (complete existing reserved feature)

**Problem:**
The opening question component (OpeningQuestion.tsx) explicitly renders `eveningResolution` as null and comments "reserved for future pipeline feature. Always set to null — do not populate it." (overnight-digest.md line 344). The schema has the field. The component has the rendering slot. The pipeline does not populate it.

This is a significant missed opportunity for daily engagement. The opening question for 2026-05-26 may ask whether Hungary's Sulyok appointment deadline will produce a scoring event; the May 27 briefing has the answer. Without an evening resolution, the loop never closes. The reader has no reason to return same-day, and no visible evidence that the question was tracked through to resolution.

For comparison: Freedom House's tracking of countries near tipping points, and Bloomberg's "what to watch" tables that are later updated, are key daily-return drivers.

**Proposed change:**
Add an optional evening/next-day resolution pass to the digest pipeline. After the primary daily pipeline runs, a lightweight secondary pass checks if any open `dailyOpeningQuestion` from the last 7 briefings has a `forwardResolutionDate` that falls within the current window, and if tonight's assessments provide a resolution. If yes, the prior briefing's JSON gets a populated `eveningResolution` field, and the current briefing's opening section includes a "Yesterday's question resolved" callout with the answer.

This requires: (a) a pipeline rule to check prior questions against current evidence, and (b) a display component for the resolution callout. The display component is trivially small. The pipeline logic is already scaffolded (forwardResolutionDate field exists on every question object).

Concrete opportunity: 2026-05-29.json has a Hungary Sulyok resolution pending (emergingRisks line 1792: "Hungary Sulyok outcome window June 1-7"). The question from the May 27 briefing can close. The reader who asked "what happened with Hungary?" returns to /updates to find out.

**Reader value / why it drives daily return:**
Closes the epistemic loop. A daily briefing that poses a question and then answers it creates a narrative arc across days — the most powerful structure for building a habitual reading relationship. This is how serialized journalism (The Economist's "charlemagne" column, Bloomberg's "big take" series) maintains retention.

**Independence-policy check:** PASS. Resolutions are derived from the same evidence-grounded pipeline. No entity influences whether its question gets resolved. The field is populated or not based on whether assessable evidence materialized.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 2 |
| **Priority Score** | **12** |

---

### 5. Archive as Research Tool: "Entity Timeline" View

**Type:** Experiment

**Problem:**
The /updates/archive is currently a list of briefings, filterable by month, sector, and entity name. It answers "show me all briefings containing Turkey." It does not answer "show me Turkey's score movement arc over the last 30 days" or "which entities have had the most score changes in May?"

This is a significant gap between what the archive contains and what a researcher, journalist, or institutional buyer would actually use it for. The archive has 30 days of scored entities across 7 indexes. That is enough to construct entity score timelines, movement frequency tables, and sector volatility summaries — all at build time from the existing daily JSON files.

Evidence: the 2026-05-29.json alone has Turkey's score movement across the arc (15.1, then 10.3 in this cycle; May 26 also had a Turkey entry at 15.1; May 28 had Turkey confirmed at 15.1). This data exists across all daily JSONs. No aggregation is done today. The ArchiveEntry type (site/src/data/updates/archiveIndex.ts, not read but referenced in ArchiveList.tsx) captures only `scoreChanges` count, topEntities, indexSlugs — not per-entity score history.

**Proposed change:**
Add an "Entity Timeline" view to the archive: for a searched entity, render a chronological score chart (data points: one per briefing that mentioned the entity, with the assessed score, delta, and a one-line headline). This would be a client-side view built from the same `entityBriefingIndex.json` proposed in improvement 2. The timeline could show 30 days (the full manifest window) as a simple data table or sparkline.

For institutional buyers and journalists, this view is the most decision-relevant surface the benchmark could offer: "here is how Turkey has moved over the last month, with evidence for each step." It turns the archive from a document list into a research instrument.

**Reader value / why it drives daily return:**
Institutional users (freedom advocates, ESG analysts, journalists) return for research tasks. A timeline view is the job they are most likely trying to do — tracking an entity across time. Once this view exists, returning to the archive to extend the timeline is a natural behavior. It also makes the archive shareable: "here is Turkey's arc this month" becomes a citable URL.

**Independence-policy check:** PASS. The timeline is built from publicly published assessment records. It makes no editorial judgments beyond what is already in the scored data.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 2 |
| **Priority Score** | **10** |

---

### 6. Score-Watch Integration: Surface Tracked Entities in the Briefing Header

**Type:** Improvement

**Problem:**
Score-Watch exists as a subscription product (email alerts via Listmonk for tracked entity score changes). The subscriber has expressed interest in specific entities. But the daily briefing has no awareness of the reader's tracked entities — every reader sees the same briefing layout. There is no "entities you track" callout in the briefing.

The worker/src/index.ts has a subscriber API (`/subscriber`) that can return the list of entities a subscriber tracks. This is a Cloudflare Worker endpoint, so it is dynamic — usable in the briefing as a client-side fetch.

Evidence of the opportunity: 2026-05-29.json includes assessments of Anthropic, IBM, Turkey, UnitedHealth, Hungary, and xAI — all entities likely to have Score-Watch subscribers. A subscriber who tracks Anthropic lands on the briefing and sees a 1,155-entity wall. Their Anthropic item is in scoreChanges at position 7. There is no "your tracked entities appeared today" callout.

**Proposed change:**
Add a client-side "Your tracked entities" module to the briefing header. After the subscriber authenticates via the Score-Watch unsubscribe/preferences link, the worker returns their tracked list. On page load, the briefing JavaScript fetches this list from the worker, matches against today's scoreChanges and confirmations, and surfaces a pinned row: "Tracked today: Anthropic (+1.0), IBM (-11.2), Turkey (-3.1)." Each item links to the score-change detail anchor.

This is a static-page-compatible pattern: the page is static HTML; the personalization is a client-side JS overlay on top. No SSR required.

**Assumption flagged:** This assumes the worker subscriber API is queryable from the client (not just from the nightly pipeline). This may require a new worker endpoint for reader-facing preference queries. If that is infeasible, a simpler alternative is a URL-parameter approach: Score-Watch emails include a URL like `/updates?tracked=anthropic,turkey,ibm` which the briefing parses client-side to highlight those entities.

**Reader value / why it drives daily return:**
Personalization is the highest-leverage retention mechanic in news products. A reader who sees "your tracked entity moved today" returns every day to check. Without this, Score-Watch subscribers have no reason to visit /updates — they just wait for the alert email.

**Independence-policy check:** PASS. The personalization only affects which existing content is surfaced prominently for a given reader. It does not change scores, assessments, or independence of content. Entities do not pay for tracking placement.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 3 |
| **Priority Score** | **10** |

---

### 7. Schema-Level Content Completeness: Enforce Non-Empty Entries in scoreChanges

**Type:** Fix

**Problem:**
The 2026-05-29.json scoreChanges array contains 78 entries. A significant fraction have empty headline and evidence fields:

- Amazon (line 250): `headline: ""`, `evidence: []`
- Australia (line 318): `headline: ""`, `evidence: []`
- Belgium (line 328): `headline: ""`, `evidence: []`
- Booz Allen Hamilton (line 360): `headline: ""`, `evidence: []`
- Costa Rica (line 563): `headline: ""`, `evidence: []`
- DeepMind/Google (line 607): `headline: ""`, `evidence: []`
- 20+ more with this pattern

These appear in the LegacyScoreChangesSection (DailyBriefing.tsx lines 336-664) as cards with a name, score, and delta but no headline or evidence. The confirmed-positions table (ConfirmationsSection) similarly renders rows with empty finding columns.

This is a content quality problem with direct reader trust implications. A reader who clicks into the scoreChanges section to understand why Amazon was assessed at 12.8 sees a card with no explanation. This is especially damaging for a product positioning itself as evidence-driven and comparable to Bloomberg or Freedom House, which never publish empty fields.

Root cause: the overnight digest populates these entries for rotation-state tracking purposes (maintaining assessment queue state), even when the current cycle's evidence window produced no new signal. The public briefing then renders all of them.

**Proposed change:**
Two-part fix:
1. In DailyBriefing.tsx, filter scoreChanges before rendering LegacyScoreChangesSection: only render cards where `headline` is non-empty. Cards with empty headline are rotation carry-forwards with no new evidence and add no reader value. The rotation data is still preserved in the JSON for pipeline use.
2. In the digest agent, for entries with `headline: ""`, add a brief automated note: "No new evidence in this cycle; published score unchanged." This is honest, traceable, and readable — far better than an empty card.

This fix applies equally to the confirmations table where `headline: ""`.

**Reader value / why it drives daily return:**
A briefing that only shows evidence-backed entries builds reader trust. A briefing with 20 empty cards teaches the reader to skip sections. The filtering does not change scores or independence — it changes what is displayed in the reader-facing briefing.

**Independence-policy check:** PASS. Filtering empty cards is a display decision, not a scoring or suppression decision. The full JSON record (including empty entries) remains in the static file for audit purposes.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **11** |

---

## Priority Matrix

| # | Title | Priority Score | Type |
|---|---|---|---|
| 1 | Today-in-Brief Module | **15** | New feature |
| 3 | Section Order Restructuring | **13** | Improvement |
| 7 | Schema-Level Content Completeness | **11** | Fix |
| 2 | Entity-Briefing Backlink | **12** | New feature |
| 4 | Evening Resolution Field | **12** | New feature |
| 5 | Archive Entity Timeline View | **10** | Experiment |
| 6 | Score-Watch Integration in Header | **10** | Improvement |

---

## Missing Assumptions (Flagged)

- **topSignals data quality:** The SignalStack component (which renders signals 7 of the page) receives `topSignals` and `sectorAlerts` from JSON. In 2026-05-29.json, `topSignals` does not exist as a top-level field (it is absent from the schema shown) and `sectorAlerts` is `[]`. This means section 7 renders null on what may be one of the richer content days. Whether `topSignals` is consistently populated across all briefings was not verifiable without reading all 30 daily files. This should be audited before any section reordering.

- **Score-Watch worker query capability:** Improvement 6 assumes the worker can serve subscriber entity lists to the browser. This is an architectural assumption that requires system-architect validation before the PM spec is finalized.

- **Build-time cost of entityBriefingIndex:** Improvements 2 and 5 depend on a per-entity briefing index generated at build time. With 1,160 entities and 30 briefings, this is a large cross-product computation. The static export pattern can handle it, but build time implications should be assessed.

- **Confirmations vs. scoreChanges overlap:** Several entities appear in both `scoreChanges` and `confirmations` in the same briefing (e.g., Apple appears in scoreChanges at line 279 and confirmations at line 1687 in 2026-05-29.json). The current rendering does not deduplicate these. This is a display quality issue independent of the above improvements but should be flagged for the UX designer.

---

## Success Metrics (baseline-less; requires instrumentation first)

- **Daily return rate:** % of Score-Watch subscribers who visit /updates within 24 hours of briefing publication. Proxy for "reason to return."
- **Scroll depth:** % of sessions that reach the Sector Findings section. Current estimated baseline: low (long page, heavy early sections). Target: 50%+ reach section 3.
- **Entity page → /updates referral rate:** % of entity page sessions that navigate to /updates (currently 0 because no link exists). Target: measurable within 60 days of improvement 2.
- **Archive engagement:** average session length on /updates/archive. Current: unknown. Entity timeline view (improvement 5) should increase this substantially for research-mode users.
- **Opening question return rate:** % of readers who return to a prior briefing URL after the question's forwardResolutionDate (improvement 4). Measures narrative loop closure.
