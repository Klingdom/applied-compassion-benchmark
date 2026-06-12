# Site UX Review — Compassion Benchmark
**Date:** 2026-06-12
**Scope:** Whole-site review with emphasis on entity detail density, information hierarchy, navigation IA, and the landing-to-action journey.
**Method:** Static code review of all key templates grounded in actual file content. No code was modified.

---

## Highest-Leverage Simplification (lead finding)

**The entity detail page has accumulated too many visible text regions before the user reaches the data that matters.**

Between the top of the page and the dimension bars, a user on a typical entity page currently sees, in order:
1. An AEO lead sentence (tiny, visually separate)
2. An "If you remember one thing" callout box
3. The full hero (name, band, rank, cohort line, band gloss, ScoreLegend details, composite score box)
4. The band-position strip
5. The cohort rug details toggle
6. The sparkline and trend caption
7. The "View score history" link
8. The evidence-review freshness stamp (a second horizontal bar)
9. The EntityEvidenceCard (assessment record section)
10. The tier-provenance chips strip (a third horizontal bar)
11. The floor-designation disclosure (when present — a full red-bordered panel)
12. Then finally: the dimension section header, best/worst badges, composite breakdown, and radar

That is eleven distinct content regions, several of which emit their own horizontal `<section>` borders, before reaching the substantive dimension data. On a 1400px desktop the composite number card and "If you remember one thing" callout are visible simultaneously, which creates a redundancy: the callout says "Ranks #N of M. Strongest on X, weakest on Y." and the hero says the same rank and the same band gloss.

**The simplification:** merge the AEO lead sentence and the "If you remember one thing" callout into the hero itself. The AEO sentence can remain as `data-pagefind-meta` content without its own visible strip. The key-takeaway (strongest/weakest + last headline) belongs as a single line of supporting text under the composite score card, not a separate named callout box. This collapses sections 1 and 2 into the hero, removing one distinct visual region and one named label ("If you remember one thing") that reads as editorial hype in a data-serious context.

---

## Prioritized Findings

Priority formula: Impact × Strategic Alignment × Confidence − Effort − Risk

---

### Finding 1 — Entity page: three sequential horizontal bars before the dimension data create a scroll wall (Priority: Critical)

**File:** `site/src/components/entity/EntityDetail.tsx` lines 427–727

**What is happening:** After the hero section, three independent `<section>` blocks each with a `border-b border-line` emit three visual "shelves" in sequence: the evidence-review freshness stamp (lines 650–682), the EntityEvidenceCard (lines 684–689), and the tier-provenance chips strip (lines 691–727). None of these link to each other visually. On mobile they stack as three separate rows of small text before the user reaches any of the scored data.

**Simplify this:** Consolidate the freshness stamp, evidence-card, and tier-provenance chips into a single collapsible evidence panel. The default-open state of this panel should show: one line "Evidence reviewed [date] · [finding/no finding]" plus the tier chips in the same row. The full EntityEvidenceCard expands on tap/click via a `<details>`. This reduces three borders to one and removes the visual interruption before the dimension bars. The freshness signal and evidence quality signal are related — showing them together is more informative, not less.

**Keep prominent:** The evidence-reviewed date and the "evidence found / no change" signal. These are trust builders and should remain visible without a click.

---

### Finding 2 — Entity page: the "If you remember one thing" callout box is redundant with hero content (Priority: High)

**File:** `site/src/components/entity/EntityDetail.tsx` lines 442–478

**What is happening:** This callout emits: "Ranks #N of M. Strongest on X (score), weakest on Y." The hero section (lines 480–648) already shows rank, band, cohort, and band gloss. The dimension section (lines 856–1175) already shows best/worst dimension badges. The callout is three-way redundant.

**Simplify this:** Remove the named callout box. The content it contains — rank, strongest/weakest dimension — is already present in adjacent sections. If a "key takeaway" line is kept for AEO purposes, move it inline below the composite score card as a one-line data note (`Strongest: X · Weakest: Y`), not a bordered box with a heading. Dropping the box label "If you remember one thing" also removes an editorial-voice phrase that sits uncomfortably next to "evidence-first, no hype" positioning.

**Keep prominent:** The composite score number, band label, and rank. These are already in the hero and are correct emphasis targets.

---

### Finding 3 — Entity page: the composite breakdown and consistency callout appear above the dimension radar (Priority: High)

**File:** `site/src/components/entity/EntityDetail.tsx` lines 893–973

**What is happening:** The composite breakdown formula (`base + integration premium = composite`) and the consistency callout ("Moderately uneven profile…") sit above the radar chart in the dimension section. A first-time user reading top to bottom hits the math explanation before seeing the visual shape of the scores. The formula requires understanding the scoring system before the scores are visible.

**Simplify this:** Move the composite breakdown `<details>` toggle to below the radar + dimension bars grid (near the deviation bars and band distribution, which are already below). The formula is important for trust and verification, but it is not the first question a user asks when landing on an entity. The order should be: what shape is this entity (radar) → what are the scores (bars) → how was the composite calculated (details toggle). The breakdown can remain fully accessible, just repositioned.

**Keep prominent:** The base score + integration premium equation and the consistency callout — they are important for credibility. They just do not belong above the visual data.

---

### Finding 4 — Entity page: best/worst dimension badges repeat information already in the radar chart (Priority: Medium-High)

**File:** `site/src/components/entity/EntityDetail.tsx` lines 872–891

**What is happening:** The "Strongest: X score · Weakest: Y score" badges appear above the radar. The radar itself visually encodes which dimension has the largest and smallest polygon area. Having both creates a pattern where a user reads the text summary before the visual, which removes the visual's job.

**Simplify this:** Remove the best/worst badges from above the radar. Instead, add a `title` attribute or ARIA label to the radar's highest and lowest axis points to surface this for screen readers. For sighted users the polygon speaks for itself. If the text callout is kept for any reason, place it as a caption line below the radar, not above it as a lead-in header.

**Keep prominent:** The radar itself. It is the right visual for an 8-dimension profile and should be allowed to be the first thing the eye lands on in the dimension section.

---

### Finding 5 — Home page: too many sections with near-identical content purpose (Priority: Medium-High)

**File:** `site/src/app/page.tsx`

**What is happening:** The home page has these sections in sequence: Hero → Latest research → Newsletter → Benchmark institution callout → Published indexes → How it works / Research → Services (6 cards) → Who it's for (4 cards) → Independence + Starting paths → Final CTA. That is 10 sections with 2 separate "what this is" explanations (the hero description and the "benchmark institution callout"), 2 separate "how to use it" sections (the hero panel and "Best starting paths"), and services listed twice (Services section and the "starting paths" list). Users doing a 5-second scan see too many sections of the same weight and cannot identify where the action is.

**Simplify this:** Collapse the "Benchmark institution callout" (the standalone `<Callout>` at line 205) into the hero description — the hero already says everything that callout says. Remove or compress "Best starting paths" since the hero already has three CTA buttons and the Services section covers those destinations. The bottom of the home page should be a single clear CTA rather than both "Final CTA" and the repetitive independence/paths panels.

**Keep prominent:** The published indexes grid (this is the core product), the live research section (demonstrates activity and credibility), and the newsletter capture.

---

### Finding 6 — Daily briefing: 21 numbered sections in DailyBriefing.tsx with no clear triage for a 90-second reader (Priority: Medium-High)

**File:** `site/src/components/updates/DailyBriefing.tsx` lines 259–524

**What is happening:** The briefing renders sections in this order: ReadingProgress, DailyBriefingHeader, BriefingJumpNav, OpeningQuestion, LeadSignalCard, ScoreSparkline, ForwardTriggerCountdown, BrutalInsightCard, MidBriefingSubscribe, HighCompassionContrast, TodaysAnalysisSection, SignalStack, SectorTrendsSection, EmergingRisksSection, FailureModeCard, MethodologyInnovationList, ForwardSignalsList, InsightsSection, ScoreMovementDashboard, BoundaryWatch, LegacyScoreChangesSection, EvidenceLedger, FloorConductSection, Audit Trail details, FloorDesignationsPanel, CompletionBlock, Purchase CTA, Archive nav. That is 28 possible rendered components. The BriefingJumpNav provides chips, but users still need to understand what each section is before clicking.

The "opening question," "brutal insight," "high compassion contrast," and "today's analysis" sections all exist in the same content tier — they are all editorial synthesis. They overlap. A reader cannot immediately distinguish why one exists and not another.

**Simplify this:** For the reader, define two tiers explicitly in the layout:
- **Quick read** (always visible, no interaction): LeadSignalCard + SignalStack. This is what happened today.
- **Deep read** (on demand, behind named disclosures or a "Read full briefing" toggle): everything else.

The BrutalInsightCard, OpeningQuestion, HighCompassionContrast, and TodaysAnalysisSection should be unified under a single "Today's analysis" section with a consistent visual frame, not rendered as four separate named sections. A reader arriving at the briefing cannot distinguish "brutal insight" from "today's analysis" — they are the same content function.

**Keep prominent:** LeadSignalCard, the score movement summary, and the ScoreMovementDashboard. These are the informational spine of the daily publication.

---

### Finding 7 — Navigation: "Updates" has a live-wire dot but no other nav item indicates freshness or primary path (Priority: Medium)

**File:** `site/src/components/layout/Navbar.tsx` lines 77–88

**What is happening:** "Updates" is styled `text-text` (white) with a red dot, which makes it the most visually prominent nav link. "Indexes" has a dropdown but the same muted styling as all other items. For a new user, the nav signals "today's updates are important" but does not signal that the indexes are the core product. A researcher arriving to look up a specific entity or index has no visual anchor.

**Simplify this:** The search entry point for entities is buried on the /indexes page. Either add a search icon in the navbar that opens the EntitySearch component, or promote the "Indexes" dropdown to include a search affordance as its first item. The "Contact Sales" button at the far right is the only filled (primary) button in the nav, which is appropriate for a commercial call-to-action — but for non-commercial users (researchers, journalists), the nav provides no fast path to an entity lookup without clicking through two levels.

**Keep prominent:** The Updates live-wire dot — it signals the platform is active. The Contact Sales button hierarchy.

---

### Finding 8 — Index pages: 8 dimension column headers (AWR, EMP, ACT, etc.) are not decoded anywhere on the page without a click (Priority: Medium)

**File:** `site/src/app/fortune-500\page.tsx` lines 22–38; `site/src/components/index/RankingTable.tsx`

**What is happening:** The RankingTable for Fortune 500 and other indexes renders 8 dimension score columns with 3-letter codes as headers. A new user reading the table sees "AWR 3.2 EMP 2.8 ACT 4.1" with no inline label. The IndexHero above the table explains the dimensions in running text, but a user who scrolls past the hero into the table loses that context. On mobile the table is horizontally scrollable and the dimension headers scroll out of the sticky portion of view.

**Simplify this:** Add a one-line "Column key" line directly above the table, visible without a click: "AWR = Awareness · EMP = Empathy · ACT = Action · EQU = Equity · BND = Boundaries · ACC = Accountability · SYS = Systems · INT = Integrity". This is static text that can live in the RankingTable component as an optional `showColumnKey` prop, defaulting to true when dimension score columns are present. Alternatively, replace the 3-letter codes with abbreviated labels in the header row (e.g., "Aware." "Empath." "Action" "Equity" "Bound." "Acct." "Systems" "Integ.") — these fit in the same space on desktop and are self-explaining.

**Keep prominent:** The table itself, the composite score, the band pill, and the entity name as a link.

---

### Finding 9 — /indexes page: the "Index buyer paths" table and "Recommended CTAs" panel are operations documentation, not user-facing copy (Priority: Medium)

**File:** `site/src/app/indexes\page.tsx` lines 238–302

**What is happening:** The indexes page contains two panels at the bottom: "Index buyer paths" (a four-column table with columns: Visitor type, Likely need, Best next step, Revenue path) and "Recommended calls to action from index pages" (a bullet list of five CTAs). These read as internal product planning notes, not as user-facing content. A researcher arriving at /indexes who scrolls to the bottom sees a table that explicitly labels one column "Revenue path." This contradicts the independence-first brand voice and reduces trust in the surrounding content.

**Simplify this:** Remove both panels from the public /indexes page. Move them to an internal product doc or CLAUDE.md planning notes. Replace with a single short paragraph reinforcing the independence policy and a link to Methodology, which is a stronger trust-builder for the target users.

**Keep prominent:** The featured report launch card (Countries Index), the EntitySearch component, and the index cards grid.

---

### Finding 10 — Entity history pages: exist but are not surfaced from the entity page with enough prominence (Priority: Medium)

**File:** `site/src/components/entity/EntityDetail.tsx` lines 634–646

**What is happening:** The "View score history →" link is a small `text-accent` text link that appears below the sparkline. The sparkline itself is only shown when there are 3+ scored events. For entities without a sparkline, the link to the history page is absent (the condition at line 374 shows `hasSparkline = scoredEvents.length >= 3` and at line 638 `historyHref && (...)` renders regardless of sparkline). So the history link does appear for all entities with a historyHref, but it is visually subordinate to the surrounding hero content.

**Simplify this:** The history page is high-value for the Score-Watch product — a user who sees movement over time is far more likely to subscribe to a Score-Watch Alert. Promote the "View score history" link to a visible button or a labeled inline affordance (e.g., a small "History" tab alongside the composite score card), not a text link buried below optional sparkline content. This is a link that supports the primary revenue path on entity pages.

**Keep prominent:** The composite score number, band, and rank as the primary hero anchors. The score history link should be secondary but discoverable without scrolling.

---

### Finding 11 — Methodology page: internal document references (ACB-HAB-001, ACB-PAB-001) appear in the hero panel without context for public users (Priority: Low-Medium)

**File:** `site/src/app/methodology\page.tsx` lines 48–74

**What is happening:** The hero right-panel shows a table with rows for "Document ID: ACB-HAB-001", "Companions: ACB-PAB-001 and ACB-STD-001", "Sensitivity: Restricted assessor-use instrument." For a researcher, journalist, or executive arriving at the methodology page, these document IDs signal internal credentialing but not public understanding. The label "Sensitivity: Restricted assessor-use instrument" in particular may create an impression that the methodology itself is not fully public.

**Simplify this:** The hero panel should lead with user-facing reassurance: what does the methodology guarantee for readers of the public scores (independence, evidence-grounding, reproducibility). The document IDs and sensitivity label can remain in a secondary section of the methodology page for assessors and institutional clients, but they should not be in the first visible panel for general visitors.

**Keep prominent:** The "8 dimensions, 40 subdimensions" structure and the independence policy. These are the trust-building content for the methodology page.

---

### Finding 12 — Mobile: RankingTable horizontal scroll with no scroll affordance indicator (Priority: Low-Medium)

**File:** `site/src/components/index/RankingTable.tsx` lines 251–253

**What is happening:** The table is wrapped in `overflow-auto` which enables horizontal scroll on mobile. There is no visual affordance indicating the table scrolls horizontally. A user on a 375px screen sees the table cut off without knowing there is more content to the right. The Fortune 500 table has 14 columns, which means on a 375px screen the user sees only the first 3–4 columns (Rank, F500, Company, Sector) without knowing the scores exist.

**Simplify this:** Add a scroll-shadow or a "scroll to see scores →" caption on mobile below the table. The simplest implementation is a right-edge gradient fade on the table container when the table overflows, which is a single CSS addition to the `overflow-auto` wrapper. Alternatively, on mobile the default column set could be reduced to: Rank, Name, Composite, Band — with a toggle to show all dimension columns. This is the most important mobile improvement for the index pages.

**Keep prominent:** The entity name as a link, composite score, and band on mobile.

---

### Finding 13 — Empty state: EntityEvidenceCard returns null silently when no Tier-A evidence exists (Priority: Low)

**File:** `site/src/components/entity/EntityEvidenceCard.tsx` lines 1–17 (docstring)

**What is happening:** The component's own docstring states "Returns null when there is nothing to show (tierCounts.A === 0, no methodology rulings, no active boundary watch) so zero-evidence entities look identical to the pre-PR-2 baseline." For an entity page where the section has been added to the layout, the absence of the component is invisible to the user. However, the freshness stamp section above it (lines 650–682 in EntityDetail) still renders. So a user sees "Evidence reviewed [date] · No material change in the last 14 days" followed by nothing, then the tier-provenance chips strip with zero chips. This creates a gap where the user wonders "where is the evidence section?"

**Simplify this:** When the EntityEvidenceCard renders null, the tier-provenance chips strip (lines 691–727) should also be suppressed. Add a coordination condition: `hasTierCounts && tierCounts && evidenceCardProps !== null`. This is already implied by the data flow but not guarded in the JSX. No new UI needed — just ensure the two related sections are both present or both absent.

**Keep prominent:** The evidence-reviewed freshness stamp should always render when a review has occurred — this is the signal the platform is actively maintained.

---

## Consistency Issues (no individual finding number — cross-cutting)

**Header strip pattern is inconsistent.** Entity pages use `<section>` with `border-b border-line` for the freshness stamp, evidence chips, and (optionally) floor designation — all as horizontal strips. The AEO lead sentence is also a bordered strip. Index pages have a different pattern: an AEO sentence as `<p>` with `border-b border-line/40`. These visually similar patterns map to different semantic functions (navigation, data, evidence status, SEO) which makes it difficult for users to develop a mental model of what each strip means.

**Recommendation:** Define three strip types and use them consistently site-wide: (1) an "AEO/SEO" strip in the smallest type size with `border-line/40` opacity — data-only, no user interaction; (2) an "evidence status" strip at mid size — always one line, always actionable or linked; (3) a "methodology disclosure" panel — full border, colored background, always about a significant finding. Currently all three are implemented ad hoc in EntityDetail.tsx.

**Terminology inconsistency.** The nav says "Updates." The page title says "Daily Briefing." The archive says "Briefings." The bottom of the briefing says "View archive." These all refer to the same content family but use different words. A user who bookmarks /updates and then sees the title "Daily Briefing" is not confused, but the site never commits to one word. "Updates" is fine as the nav label; the page should confirm it ("Today's Briefing") rather than using a different content type name ("Daily Briefing" sounds like a paid product).

---

## Flow Assessment: Landing → Understanding → Next Action

**Current path for a researcher looking up a specific company:**
1. Land on homepage → sees hero with three CTAs (Explore Indexes, Read Methodology, Purchase Research) → no entity search
2. Click "Explore Indexes" → /indexes hero → scroll past two panels → reach EntitySearch component
3. Type company name → click entity link
4. Land on entity page → AEO strip + "If you remember one thing" callout + hero → eventually reach dimension data

Friction points: step 1 has no direct entity search, requiring a full page load. Step 4 has 2 intermediary content regions before the data.

**The clearest fix for the primary journey** is surfacing EntitySearch earlier — either in the hero of the home page or as a typeahead search in the navbar. The /indexes page already has EntitySearch implemented; it just cannot be reached without navigating there first.

**For a user arriving on an entity page directly (from search, from a briefing link):**
The current page gives them rank, band, composite, and dimension data in that order — which is the right order. The simplifications in Findings 1–4 above sharpen this further by removing the two visual interruptions (redundant callout, three stacked evidence strips) between the hero and the data.

---

## What to Simplify vs. Keep Prominent — Summary Table

| Element | Verdict | Rationale |
|---|---|---|
| AEO lead sentence strip | Simplify: make invisible (data-pagefind-meta only) | Only needed for answer engines, not users |
| "If you remember one thing" callout box | Simplify: merge into hero as a data note | Redundant with hero + best/worst badges |
| Evidence freshness stamp | Keep prominent | Active-maintenance signal; trust builder |
| EntityEvidenceCard | Keep (collapse trigger by default) | Core evidence-first purpose |
| Tier-provenance chips | Simplify: consolidate with evidence card | Currently a standalone strip that confuses without context |
| Composite breakdown details | Keep (move below radar) | Credibility, but not the first question |
| Best/worst dimension badges | Simplify: remove text badges above radar | Radar encodes this visually |
| Band-position strip | Keep prominent | Quickest single-line context for rank |
| Sparkline + trend caption | Keep | Supports Score-Watch CTA directly |
| Dimension radar | Keep prominent | Correct visual for 8-dimension profile |
| DimensionProfileBar (inside details) | Keep as-is | Already correctly collapsed |
| Deviation bars (inside details) | Keep as-is | Already correctly collapsed |
| Cohort rug (inside details) | Keep as-is | Already correctly collapsed |
| Band distribution (inside details) | Keep as-is | Already correctly collapsed |
| Floor designation panel | Keep prominent | Required methodology disclosure |
| Daily briefing: editorial synthesis sections × 4 | Simplify: unify into one "Today's analysis" | Four sections for same content function |
| Daily briefing: audit trail | Keep collapsed | Already correctly behind details |
| /indexes: "Index buyer paths" table | Simplify: remove from public page | Internal planning copy |
| /indexes: EntitySearch | Keep prominent, promote to homepage | Primary entry point for research users |
| Navbar: Updates live-wire dot | Keep | Active-maintenance signal |
| Navbar: entity search affordance | Simplify: add at navbar level | High-friction path currently |
| RankingTable dimension headers (coded) | Simplify: add column key or full labels | Requires explanation unavailable at scroll depth |
| RankingTable mobile | Simplify: add scroll affordance or reduced default columns | Scores are invisible without scrolling |

---

## Assumptions Affecting Implementation

1. The AEO lead sentence (`data-pagefind-meta="answer"`) must remain in the DOM for search engine extraction. Making it visually invisible (e.g., `sr-only` or `opacity-0`) is an acceptable UX simplification that preserves SEO intent. Confirm with the knowledge-architect agent whether this breaks any structured-data extraction pipeline before implementing.

2. The EntityEvidenceCard receives `evidenceCardProps` from `renderEntityPage.tsx` — any visual consolidation of the evidence strips must trace back to that render function's prop-passing logic, not just the EntityDetail display component.

3. The DailyBriefing section-unification proposal (Finding 6) requires consensus on which of BrutalInsightCard, OpeningQuestion, HighCompassionContrast, TodaysAnalysisSection contains the canonical editorial content on any given day — the overnight JSON schema determines which is populated. The simplification may need to be a "pick the first non-empty" strategy at the component level, not a removal of any single component.

4. Static export constraint: any search-at-navbar-level solution must be a client component using the existing EntitySearch pattern (filter/search over pre-loaded JSON), not a server-side search endpoint.

---

*Grounded in: EntityDetail.tsx (1552 lines), DailyBriefing.tsx (1793 lines), home page.tsx, indexes page.tsx, fortune-500 page.tsx, Navbar.tsx, RankingTable.tsx, IndexHero.tsx, updates/page.tsx, updates/[date]/page.tsx, updates/special/page.tsx, EntityEvidenceCard.tsx, nav.ts, methodology/page.tsx.*
