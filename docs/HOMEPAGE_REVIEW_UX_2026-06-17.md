# Homepage UX Review — Compassion Benchmark
**Date:** 2026-06-17
**Scope:** Home page (`site/src/app/page.tsx`) and all components rendered on it
**Goals under review:** (1) knowledge acquisition, (2) understanding the methodology, (3) discovering and viewing the daily briefing
**Method:** Static code review of `page.tsx` and each imported component; cross-reference with `nav.ts`, prior UX audits, and S1 spec. No code modified.

---

## Highest-Leverage UX Move (lead finding)

**Collapse the master BandDistributionBar and its Callout predecessor into a single combined section, and move the "Today's research" block to the second position on the page.**

The current home page buries the live research wire — the product's highest-signal proof of activity — below two chart sections that require prior knowledge to read. A first-time visitor arriving without any understanding of band distribution is asked to process a five-color stacked bar and a 7-chart small-multiples grid before being shown a single piece of evidence that the benchmark is actively working. The daily briefing block, which is a far stronger credibility signal and curiosity trigger than the charts, appears as the fourth visual cluster below the hero. Moving it to second position costs nothing in cognitive load and pays immediately in engagement and return-visit motivation.

This is the single change that simultaneously serves all three goals: it introduces knowledge (real evidence in plain language), it implies methodology (the delta and band-change labels demand explanation), and it makes the briefing path friction-free (the preview is the hook).

---

## Section Map: current order

The home page renders the following sections in order, with approximate scroll depth on a 1440px / 900px viewport:

| # | Section | Estimated scroll depth | Goal served |
|---|---------|----------------------|-------------|
| 1 | Hero (h1, p, 3 buttons, 4 stats, publication table) | 0–100% fold | Knowledge |
| 2 | Flagship report Callout (G3 — "State of Institutional Compassion 2026") | Below fold (~110%) | Knowledge |
| 3 | S3.1 master BandDistributionBar ("state of institutional compassion") | Below fold (~150%) | Knowledge |
| 4 | S3.3 7-index small-multiples grid ("Seven indexes at a glance") | Scroll 2–3 | Knowledge |
| 5 | "Today's research" live wire (conditional) | Scroll 3–4 | Briefing |
| 6 | Newsletter signup | Scroll 4 | Retention |
| 7 | Published indexes grid (8 cards) | Scroll 5–6 | Knowledge |
| 8 | "How it works" + "Current research program" panels | Scroll 6 | Methodology |
| 9 | Services grid (6 cards) | Scroll 6–7 | Commercial |
| 10 | "Who the benchmark is for" (4 cards) | Scroll 7 | Commercial |
| 11 | Independence policy panel | Scroll 8 | Trust |
| 12 | Final CTA Callout | Scroll 8 | Commercial |

**Total scroll depth before reaching the methodology path (section 8): approximately 6 full viewport heights on desktop.**

---

## Priority-Ranked Findings

Priority formula: Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk

---

### Finding 1 — "Today's research" is buried at scroll depth 4; it is the strongest engagement hook on the page (Priority: Critical) — Goals: Briefing, Knowledge

**What is happening:**

The conditional live-research section (page.tsx lines 203–276) reads `latest.json`, renders up to two score-change cards and one highlight, and links to `/updates`. It contains the only concrete, today-dated, named-entity evidence on the home page. The June 17 briefing shows 1,160 entities scanned, 19 assessed, with a named jury verdict about Meta Platforms — this is enormously more attention-catching than the abstract band distribution chart.

However, the section is rendered only after: the hero, a flagship callout, the master bar, and the full 7-index small-multiples grid — all four of which are static data that does not change day to day. A returning visitor who already understands the mission must scroll past four sections of content they have seen before to reach the proof that today's work happened.

The path to the daily briefing from the home page is currently:
1. Land on home
2. Scroll past hero (no briefing mention)
3. Scroll past callout (no briefing mention)
4. Scroll past master bar (no briefing mention)
5. Scroll past 7-index grid (no briefing mention)
6. Reach "Today's research" block
7. Click "View full briefing"

That is seven steps and approximately 6–8 seconds of scrolling before the first briefing link in the page body appears. The navbar does have "Updates" with a red live-dot, which is the fastest path — but the live-dot is subtle and requires recognizing it as a link rather than a status indicator. Nothing in the hero or in any of the first three sections names the daily briefing or invites the visitor to see it.

**Call: elevate — move "Today's research" to second position on the page (immediately below the hero), before the Callout and charts.**

The live wire should be the first thing a visitor encounters after the mission statement, not the last thing before the newsletter.

**Interaction change required:**

The section needs a more prominent header entry point if it moves above the fold. Currently the header is `<Eyebrow>Latest evidence · {updates.date}</Eyebrow>` + `<h2>Today's research</h2>`. If this section moves up, the h2 copy should be sharpened: "Today's findings — {updates.date}" paired with the pipeline micro-line ("1,160 entities scanned · 19 assessed · 0 score changes") would give a visitor orientation in under 3 seconds.

**Edge case:** The entire section is conditional on `scoreChangesArr.length > 0 || highlightsArr.length > 0`. If both are empty (a quiet scan cycle), the section renders nothing and there is a gap in the page. When this moves to position 2, the empty state must be handled: show the pipeline stats (scanned / assessed) even when no score changes or highlights exist. A zero-change briefing is itself informative — "1,160 entities monitored; no threshold crossings today" is newsworthy. This requires a fallback render that shows the pipeline numbers and the "View full briefing" link even when the arrays are empty.

---

### Finding 2 — The methodology path requires 6 viewport heights of scrolling or a navbar click not labeled "How it works" (Priority: High) — Goal: Methodology

**What is happening:**

The hero contains "Read Methodology" as the second of three secondary buttons (page.tsx line 68). The button is styled as the default variant (border, dark background — lower visual weight than the primary blue gradient "Explore Indexes" button). Below the fold, "How the benchmark works" appears at section 8 (page.tsx lines 358–399) — that panel names the 8 dimensions and links to `/methodology` via a primary-variant button. The navbar also contains "Methodology" as a link.

So the methodology path is available via: the hero button, the navbar, and section 8's panel. However:

- The hero button is secondary weight, third in a row of three, and competes visually with two other calls to action ("Explore Indexes" first, "Purchase Research" third).
- Section 8 is at scroll depth 6 — a visitor who did not click the hero button and missed the navbar is unlikely to reach it organically.
- Neither the flagship Callout (section 2) nor the master bar section (section 3) mention that the bands have a formal definition or link to methodology. The master bar renders a 5-band legend but the band names ("Critical," "Developing," etc.) have no hover definition or link. A visitor who sees "67.7% cluster in the middle bands" in the Callout copy has no pathway to learn what "middle bands" means without scrolling to section 8 or clicking the navbar.

The critical gap: **the chart sections introduce terminology that requires methodology to understand, but they do not link to methodology at the point of need.** Band names are undefined at the point of use. The 8 dimensions are named in section 8's panel but not in the chart sections.

**Call: reorder + elevate — move the "How the benchmark works" panel from section 8 to immediately below "Today's research" (new section 3 position), and add inline links on band names within the ChartFrame dek and the Callout body to `/methodology#bands`.**

Alternatively, at minimum, add a "How scores work →" link as a third line in the ChartFrame dek. The ChartFrame component already has a `dek` prop and renders it as `text-muted text-[0.88rem]` — a small `<a>` appended to the dek achieves this with zero structural change.

**Content note for knowledge-architect:** The current "How the benchmark works" panel copy (page.tsx lines 360–380) names the 8 dimensions as bold spans followed by a one-sentence scoring description. This is appropriate. What is missing is a one-sentence answer to the most basic first question: "What does compassion mean in an institutional context?" The existing hero paragraph addresses this partially ("recognize, respond to, and reduce suffering") but the panel jumps immediately to the dimensions without bridging the concept. The methodology panel on the home page should open with one sentence defining the measurement target before naming the dimensions.

---

### Finding 3 — The flagship Callout and the master BandDistributionBar are redundant entry points to the same data (Priority: High) — Goals: Knowledge, Density

**What is happening:**

Section 2 is a Callout (page.tsx lines 126–152) for the "State of Institutional Compassion 2026" report. Its body copy reads: "Across 1,156 institutions worldwide, the modal result is mediocrity — 67.7% cluster in the middle bands, and a 90.5% equity gap persists at the bottom of every index family."

Section 3 is a ChartFrame wrapping a BandDistributionBar for index="all" (page.tsx lines 155–166). The ChartFrame dek reads: "Of 1,155 institutions benchmarked across governments, corporations, AI labs, and cities — most sit in the Critical or Developing bands."

These two sections are 18px apart in vertical rhythm, they describe the same underlying datum from different angles, and they link to the same destination (the 2026 report via the Callout button; the home page itself via `path="/"` in the ChartFrame). A visitor reading both gets: a sentence summary → a link → a chart of the same data → a "Cite this chart" affordance. The chart does not add new information that the Callout's copy did not already convey — it visualizes the claim. The Callout's copy implicitly describes the chart shape ("67.7% in middle bands" = the Functional + Establishing bands are large).

The equity gap claim (90.5%) is not visible in the chart at all — it is only in the Callout copy. So the Callout carries one unique data point, the chart carries the visual encoding. Neither is redundant in isolation, but rendering them as two separate sections with identical-feeling editorial purpose creates a stutter effect: the visitor reads a finding, then is shown the same finding as a chart, then is shown the same finding as 7 sub-charts.

**Call: merge — combine the Callout and the master bar into a single section with the Callout's headline, the body copy (including the equity gap stat), and the BandDistributionBar chart immediately below the copy (no separate section boundary). The "Read the 2026 report" button anchors the combined section. The ChartFrame's "Cite this chart" affordance is preserved.**

This creates one coherent "field overview" section rather than two sequential sections. It removes one section boundary and one scroll step without removing any data.

**Interaction note:** The merged section should use a visual treatment distinct from both the current `Callout` component and the current `ChartFrame` component — the existing Callout has a gradient border, the ChartFrame has no border. Merging them means choosing one container. The Callout container is the right choice (it carries the visual weight appropriate for flagship content); the chart renders inside it, the dek text serves as the chart's title, and the "Read the 2026 report" button appears below the chart.

---

### Finding 4 — The 7-index small-multiples grid is cognitively demanding without prior knowledge of what the bands mean (Priority: High) — Goals: Knowledge, Density

**What is happening:**

Section 4 (page.tsx lines 169–200) renders a 7-card grid, each card containing a BandDistributionBar for one index. The SectionHead description reads: "Band distribution per index, sorted by share in the top two bands (Established + Exemplary). Shows which domains lead and which are in crisis."

This is the right information. The problem is sequence: a visitor who has not read the methodology does not know that "Established + Exemplary" are the good bands, that the warm red segment (Critical) is bad, or that the left-to-right order of colors encodes a moral judgment. The sort order ("sorted by share in top two bands") is described in the dek but not visually indicated — there is no sort indicator, no rank label, no annotation on the chart that says "AI Labs is highest-performing, Fortune 500 is lowest." The visitor must mentally compare 7 stacked bars.

The chart section appears as the third major content block before any explanation of what the bands mean. The Callout above it says "middle bands" and the ChartFrame dek says "Critical or Developing bands" — but neither defines what Critical or Developing means in a score range.

**Call: reorder + trim — move the 7-index grid to after the "How the benchmark works" panel. A visitor who has just read that scores run 0–100, that Critical is below a threshold and Exemplary is above, and that the 8 dimensions combine into a composite, will read the small-multiples grid with comprehension rather than confusion.**

Additionally, the grid card copy should be enriched with one declarative sentence per index — for example, instead of just "Humanoid Robotics Labs" as the label, add a subtitle line: "Newest sector; governance frameworks not yet established." This is low engineering cost (add a `subtitle` field to the map array) and dramatically improves what the grid teaches without requiring the user to click through.

**Trim option:** If the 7-index grid stays in current position (before methodology explanation), reduce it from 7 cards to 3 representative cards (e.g., AI Labs for the frontier/tech reader, Fortune 500 for the corporate reader, World Countries for the policy reader) with a "See all index distributions →" link. This is a higher-effort change but solves the density problem by halving the vertical real estate consumed.

---

### Finding 5 — The hero 5-second scan is good but the three hero CTA buttons are equal weight, creating decision paralysis (Priority: Medium-High) — Goals: Knowledge, Methodology

**What is happening:**

The hero (page.tsx lines 47–123) has a strong left column: clear h1, a well-scoped p explaining the institution types covered, 4 stats, and a publication table on the right. The 5-second scan correctly identifies this as a benchmarking institution. This part works.

The three CTA buttons ("Explore Indexes," "Read Methodology," "Purchase Research") are styled:
- "Explore Indexes" — `variant="primary"` (blue gradient, highest visual weight)
- "Read Methodology" — `variant="default"` (border, dark)
- "Purchase Research" — `variant="default"` (border, dark)

The primary button is correct. The two secondary buttons are equal weight and compete for the visitor's second glance. "Purchase Research" is a conversion CTA that belongs lower on the page — placing it in the hero alongside "Read Methodology" signals that the commercial offer is equally important as understanding the benchmark, which undercuts the credibility-first positioning.

The hero has no mention of the daily briefing. A returning visitor who wants to check today's findings has to either know to click "Updates" in the navbar (which requires recognizing the red dot as a live-activity signal) or scroll past the hero to reach the live research section. There is no entry point for "what's new today" in the hero.

**Call: trim + reorder — remove "Purchase Research" from the hero button cluster. Add a text link or a fourth understated element for the daily briefing: a single line below the three CTAs reading "Today's findings →" linking to `/updates` (or to the today-section anchor once section order is changed per Finding 1). The hero CTA pattern becomes: primary action (Explore Indexes) + trust action (Read Methodology) + ambient hook (Today's findings →).**

The "Purchase Research" CTA is properly placed in section 9 (Services) where commercial intent has been established. In the hero it asks for money before the visitor knows what they are buying.

---

### Finding 6 — The "Published indexes" card grid (section 7) duplicates the hero's publication table and the small-multiples grid (Priority: Medium) — Goals: Knowledge, Density

**What is happening:**

The hero right panel (page.tsx lines 79–120) contains a table listing all 7 indexes with coverage numbers. Section 7 (page.tsx lines 285–355) renders 8 cards (7 indexes + "All Indexes" directory card) with pills, index names, and one-line descriptions. The card titles match the hero table row labels exactly: "World Countries Index," "United States Index," "Fortune 500 Index," etc. The cards add: pills ("2026," sector label), one-sentence description, and a click affordance to the index page.

A visitor who read the hero table already knows the 7 indexes exist and their coverage. The cards repeat the name and add the description — the description is the only net-new information. The hero table has no clickable affordance (it is a static `<table>` with no links). So the cards serve a navigation function that the hero table does not.

The redundancy is partial, not total. The problem is placement: the 7 index cards appear at scroll depth 5, after the charts and live research, where a visitor who wants to explore an index would have already clicked "Explore Indexes" in the hero or navigated via the navbar. The late-page placement means the cards primarily serve visitors who scrolled all the way down — an exhausted discovery path.

**Call: trim + reorder — make the hero table's index names clickable links to their respective pages (this is a pure HTML change: wrap each `<td>` text in `<Link>`). Then either remove the index cards grid entirely from the home page (it duplicates the clickable hero table plus the `/indexes` directory) or merge it with the "Who the benchmark is for" section as a persona-targeted entry point. If kept, the index grid should appear before the Services grid, not after it.**

---

### Finding 7 — The "Independence policy" panel at scroll depth 8 is the highest-trust content placed in the lowest-traffic position (Priority: Medium) — Goal: Knowledge

**What is happening:**

The Independence policy section (page.tsx lines 500–521) is a bulleted list panel placed between "Who the benchmark is for" and the final CTA. It contains the product's most important trust signal: explicit confirmation that entities cannot buy scores. On a benchmarking site where a reader's first suspicion is "who is paying for this ranking," this content is critical for first-visit credibility.

Currently a visitor who scrolls all the way to the bottom and reads the bullet list will feel reassured. But the median visitor does not scroll to depth 8 on a first visit. The "read more" path from the hero to independence policy does not exist.

The hero paragraph says "The benchmark is designed to make compassionate performance legible, comparable, and difficult to fake" — the word "fake" gestures at the independence concern without addressing it. The hero offers no link and no explicit statement that entities cannot pay for better scores.

**Call: elevate — move one sentence from the independence policy into the hero paragraph, and add a "How independence works →" link from the hero body to `/about` or to the independence policy section anchor. The full independence panel can remain at depth 8 for visitors who want detail, but the core claim ("entities do not pay to improve their score") should appear within the first viewport.**

Additionally, the "who is paying for this" doubt is most likely to arise at the Callout level when the flagship report is presented with commercial purchase options nearby. Adding a one-line trust note to the flagship Callout — "Published independently. Entities do not pay for rankings." — addresses the concern at the moment it is most likely to surface.

---

### Finding 8 — Empty state for the live research section is unhandled (Priority: Medium) — Goal: Briefing

**What is happening:**

The "Today's research" section (page.tsx lines 203–276) is wrapped in a conditional: `{(scoreChangesArr.length > 0 || highlightsArr.length > 0) && (...)}`. If both arrays are empty — a zero-change cycle like the June 17 briefing where `scoreChanges: 0` is present in the pipeline but `topSignals` provides highlights — the section renders fine because `highlightsArr` is derived from `topSignals.slice(0,3).map(s => s.title)`. However, if `topSignals` is also empty and `highlights` is empty, the section renders nothing. The June 17 `latest.json` shows `scoreChanges: 0` but rich `topSignals` data, so this currently works. The risk is a future briefing type that produces only pipeline data with no signals or highlights.

More importantly, the current section shows at most 2 score change cards + 1 highlight. On a zero-change confirmation cycle (like June 17), both `scoreChangesArr` and `highlightsArr` are sourced entirely from `topSignals`. If `topSignals` exists but has `actionType: "floor-confirmed"` entries with no `delta`, the score change cards would render but show no meaningful delta. The `delta` field for floor-confirmation entries is undefined or zero, which would render as "+0" or "0" with no color cue — a confusing display.

**Call:** Regardless of section ordering (per Finding 1), the empty/zero-change state needs an explicit fallback: show the pipeline numbers (scanned / assessed) and a "View full briefing for today's analysis →" link even when `scoreChangesArr` is empty and `highlightsArr` is empty. This maintains the section's informational presence on quiet cycles and confirms the benchmark is running.

---

### Finding 9 — The newsletter capture is placed between the live research section and the published indexes — a poor momentum position (Priority: Medium) — Goal: Retention

**What is happening:**

The newsletter section (page.tsx lines 278–283) uses `variant="inline"` which renders the compact horizontal form with copy "Weekly compassion score highlights" and "~1,160 entities, scored every day. Every Friday, free."

Placement is between "Today's research" and "Published indexes" — the newsletter appears immediately after the first real evidence of what the benchmark produces, before a visitor has explored any index or understood the full scope. The timing is awkward: a visitor who just read two score-change cards and one highlight has enough context to understand the value proposition for the newsletter ("I want more of this") but they have not yet decided whether to trust the benchmark enough to give their email.

The newsletter's placement also interrupts the knowledge-acquisition flow. A visitor trying to understand the benchmark must stop to process a signup form mid-scroll.

**Call: reorder — move the newsletter section to after the "Who the benchmark is for" section and before the Independence policy. By that point a visitor has read the methodology panel, seen the indexes, understood who the product is for, and is approaching the final CTA cluster. Subscribing to a weekly email is a natural pre-conversion commitment. The newsletter variant on the home page should also be upgraded from `inline` to `card` — the inline variant is designed for embedding inside other components (per the NewsletterSignup component comments); the home page deserves the fuller `card` variant with the preamble explaining what the email contains.**

---

### Finding 10 — The "Services" and "Who the benchmark is for" sections appear in the wrong order (Priority: Low-Medium) — Goal: Commercial

**What is happening:**

Section 9 (Services, 6 cards) precedes section 10 (Who it's for, 4 cards). Standard persuasion order: identify the reader → explain what exists → offer conversion. The current order says: here are six purchase options → here is who should buy them. Reversing the order makes the services feel like a natural continuation of "if you fit one of these personas, here is how to engage," rather than a product menu the reader must self-qualify.

**Call: reorder — move "Who the benchmark is for" before "Services." No content changes needed.**

---

## Mobile Assessment

The home page uses responsive layout via Tailwind breakpoints. Specific observations:

**Hero (lg:grid-cols-[1.12fr_0.88fr]):** On mobile, the publication table drops below the h1+p+buttons+stats, adding substantial scroll depth before the first CTA. The hero on a 375px screen is approximately 2.5 viewport heights — the first CTA button appears below the fold. Consider whether the publication table should be collapsed into a `<details>` on mobile or moved below the hero section entirely, so the CTA buttons are reachable within the first viewport on phone.

**Small-multiples grid (md:grid-cols-2):** On a 375px screen this collapses to single column, rendering 7 stacked BandDistributionBar charts as 7 sequential cards. This is approximately 5 viewport heights of chart content before the live research section. If the grid moves to later in the page (per Finding 4), this is less harmful. If it stays in current position, mobile visitors experience the most extreme version of the "charts before briefing" problem.

**"Today's research" score change cards (lg:grid-cols-[1fr_1fr]):** On mobile, the two cards stack vertically. Each card renders entity name, index label, delta, headline (truncated to 140 chars), and score change. On a 375px screen each card is approximately 200px tall; two cards plus the highlight block is approximately 550px. This is acceptable — the content is substantive and mobile-appropriately dense.

**Newsletter (inline variant):** On mobile the inline variant renders the text column + form in a flex-col, which is readable but the email input at `w-[180px]` may cause layout issues on very small screens if the flex does not wrap as intended. The component does have `sm:flex-row` so below `sm` it stacks — but the input width is hardcoded. Recommend testing at 320px.

---

## 5-Second Scan Assessment

What a visitor registers in 5 seconds on the current home page:

1. Logo + "Compassion Benchmark" (0.5s)
2. H1: "Benchmarking how institutions recognize, respond to, and reduce suffering" (1.5s)
3. Three buttons: Explore Indexes / Read Methodology / Purchase Research (0.5s)
4. Four stats: 1,155 entities / 7 index families / 8 dimensions / 40 subdimensions (0.5s)
5. Publication table (right panel) — partially reads the list of 7 indexes (1s)
6. Possibly the Callout headline "The State of Institutional Compassion — 2026" if the viewport height is sufficient (0.5s)
7. Misses: the daily briefing, the methodology, the independence policy, everything below the hero

**Assessment:** The 5-second scan succeeds at communicating: this is a benchmarking institution measuring institutional behavior across 1,155 entities in 7 categories. The mission is legible. What it fails to communicate: that this is a live research operation (not a static 2025 report site), what methodology-grounded means in practice, and where to go if you want to explore rather than purchase.

The visitor who completes the 5-second scan and bounces has learned: there is a benchmark, it covers institutions, there is something to purchase. They have not learned that the benchmark produced findings today, that the methodology is transparent and readable, or that there are free daily briefings.

---

## Recommended Section Order (post-improvements)

The following reorder implements the highest-priority findings with minimal structural risk:

```
1. Hero
   - h1, p (add: one-line independence mention)
   - CTAs: [Explore Indexes] [Read Methodology] + "Today's findings →" text link
   - 4 stats
   - Publication table (index names become clickable links)

2. Today's research (elevated from #5)
   - Eyebrow + "Today's findings — {date}" h2
   - Pipeline micro-line (always show, even zero-change)
   - Score change cards (when data exists)
   - Highlight card (when data exists)
   - Empty state fallback (when no cards or highlights)
   - "View full briefing" button

3. How the benchmark works (elevated from #8)
   - 8 dimensions named panel (add: one opening sentence defining the measurement target)
   - "View Methodology" primary button

4. Flagship report + master BandDistributionBar (merged, reduced from 2 sections to 1)
   - "State of Institutional Compassion 2026" headline
   - Body copy (includes equity gap stat)
   - One-line trust note: "Published independently. Entities do not pay for rankings."
   - BandDistributionBar chart (index="all")
   - "Read the 2026 report" button + "Cite this chart" affordance

5. Seven indexes at a glance (small-multiples, after methodology context)
   - Add subtitle line per index card

6. Published indexes grid (trim: make hero table links clickable, consider removing this section or merging with #7)

7. Who the benchmark is for (elevated above Services)

8. Services grid

9. Newsletter (upgraded to "card" variant, after persona section)

10. Independence policy panel

11. Final CTA
```

This reorder:
- Surfaces the daily briefing within one scroll step of the hero
- Places methodology explanation before charts that require methodology to understand
- Merges two redundant sections into one
- Removes the commercial CTA from the hero button cluster
- Positions the newsletter where conversion intent is highest
- Moves the persona section above the services grid

---

## Handoff Notes

**For dataviz:** The BandDistributionBar in the small-multiples grid renders 7 charts before the visitor has seen a band legend with defined score thresholds. The legend inside each SVG names the bands (Critical, Developing, etc.) but gives no score range or qualitative definition. The ChartFrame dek is the only place where definitions could be added inline. Recommend adding score range anchors to each band name in the SVG legend text, e.g., "Critical (0–20)" — this is a chartTokens or `BANDS` config change that would propagate to all uses of BandDistributionBar site-wide.

**For knowledge-architect:** Three copy gaps on the home page require attention:
1. The hero paragraph does not include an independence statement or define what "legible" and "difficult to fake" mean in practice.
2. The "How the benchmark works" panel's first sentence names the 8 dimensions without explaining what the benchmark is measuring before naming the framework components. Add: one sentence bridging from the product mission ("measuring how institutions recognize, respond to, and reduce suffering") to the framework ("We operationalize this through 8 measurable dimensions, each scored 0–5").
3. The flagship Callout's "90.5% equity gap" claim has no inline definition of what an equity gap means in this context. A first-time reader cannot interpret this finding without knowing the measurement model.
