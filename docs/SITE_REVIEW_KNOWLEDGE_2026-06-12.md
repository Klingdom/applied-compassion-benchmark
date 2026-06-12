# Site Review — Knowledge Architecture & Information Strategy

**Date:** 2026-06-12
**Reviewer lens:** Knowledge Architect (comprehension ladder, jargon debt, progressive disclosure, cross-page coherence). Not pixels (→ ux), not chart grammar (→ dataviz), not CTAs/pricing (→ conversion).
**Scope grounded in:** `site/src/app/page.tsx`, `methodology/page.tsx`, `indexes/page.tsx`, `ai-labs/page.tsx` (representative index), `updates/[date]/page.tsx` + `components/updates/DailyBriefing.tsx`, `updates/special/page.tsx`, `components/entity/EntityDetail.tsx`, `components/index/RankingTable.tsx` + `IndexHero.tsx`, `data/dimensions.ts`.

---

## The core tension

The founder wants the site to be a "good read" and the go-to authority — *clear, not dense*. The recent depth waves (E1, Wave 2/3 on entity pages; 21-section daily briefing) have made the benchmark **more credible but harder to read**. The product now has world-class evidentiary depth and a weak comprehension ladder on top of it. Almost every fix below is "elevate the one takeaway, collapse the rest" — the depth stays, but stops being the first thing a reader hits.

Two systemic problems recur everywhere:

1. **No single shared "how to read a score" primitive.** The 8 dimensions, 0–5 anchors, 5 bands, integration premium, and floor concept are re-taught (or left untaught) page by page. A reader who learns the schema on the entity page does not carry it to the index table, and vice-versa.
2. **Jargon is shipped before it is defined.** `AWR/EMP/ACT/EQU/BND/ACC/SYS/INT`, "integration premium," "boundary watch," "floor designation," "carry-forward," "Tier-A/B/C/D" all appear as bare labels in at least one template with no inline gloss.

---

## Prioritized findings

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each 1–5).

---

### 1. Ranking tables ship 8 bare acronym columns with zero legend — `[ELEVATE]`

**Pages:** all 7 index pages via `RankingTable.tsx` + per-page `columns` (e.g. `ai-labs/page.tsx` L19–34).
**Problem:** `RankingTable.tsx` L255–261 renders column headers as raw `{col.label}` — i.e. `AWR EMP ACT EQU BND ACC SYS INT` — with no `title`, tooltip, abbreviation expansion, or legend anywhere on the page. The index page is the **most-trafficked, most-shareable, most-cited** surface, and its central data grid is unreadable to a first-time visitor. The 5-second test fails completely: a scanner sees 8 three-letter codes and a number and cannot tell what is being measured. This is the single largest comprehension tax on the site because it sits on the highest-traffic template.
**Proposed change:** (a) Add a one-line dimension legend strip directly above every ranking table — `AWR Awareness · EMP Empathy · ACT Action · EQU Equity · BND Boundaries · ACC Accountability · SYS Systems · INT Integrity` (the data already exists in `DIMENSIONS`; render it once as a shared `<DimensionLegend />`). (b) Add `title={dimensionName}` and `<abbr>` to the score column headers in `renderCell`/the `<th>`. (c) Reuse the existing `ScoreLegend` <details> primitive (already on entity pages) so the band scale is one click away. Hand the visual treatment of the strip to ux.
**Knowledge benefit:** A reader instantly knows what the columns mean; the acronym becomes a learnable shorthand instead of a wall. Knowledge compounds because the same legend appears on all 7 indexes.
**Independence-policy check:** PASS (pure definitional restatement).
**Impact 5 · Strategic 5 · Learning 5 · Confidence 5 · Effort 2 · Risk 1 → Priority = 17**

---

### 2. The daily briefing is a 21-section scroll with no "read this in 30 seconds" tier — `[SIMPLIFY]`

**Pages:** `/updates`, `/updates/[date]` via `DailyBriefing.tsx` (1,793 lines; sections enumerated L259–521).
**Problem:** The briefing renders, in order: header, jump nav, opening question, lead signal, sparkline, forward-trigger countdown, brutal insight, mid-briefing subscribe, high-compassion contrast, today's analysis, signal stack, sector findings, emerging risks, failure mode, methodology innovation, forward signals, insights, score-movement dashboard, boundary watch, score-change detail, evidence ledger, floor conduct, audit trail, floor registry, completion block, purchase CTA, archive nav. That is the *editorial* ladder, but there is no **answer-first 30-second tier**: a reader cannot get "here are today's 3 things that moved and why" without scrolling past the opening question, lead card, and brutal-insight card. The `TodayInBrief` bullets (header L175) are the closest thing but they sit below a shrunk H1 and a thesis and compete with Stat-of-the-Day, pipeline strip, and CTAs in the same viewport. Cognitive load is extraneous: the reader spends attention navigating the *structure of the briefing* before reaching its *content*.
**Proposed change:** Define and elevate an explicit **"Today in 30 seconds"** block as the first content after the masthead: (1) the one-sentence thesis, (2) 3 `TodayInBrief` bullets, (3) the single biggest score move with delta + one-line why. Everything from "sector findings" downward (sections 8–18) collapses one level: group sections 13–18 (dashboard, boundary watch, score-change detail, evidence ledger, floor conduct, audit trail) under a single "Full detail & evidence" region using the Wave E1 `<details>` pattern already used for the audit trail. The jump-nav stays for power users. Net: a busy reader finishes the brief in 30s and *opts into* depth.
**Knowledge benefit:** Inverted pyramid restored — conclusion first, evidence on demand. Most readers (scanners) get the answer; researchers still get everything.
**Independence-policy check:** PASS (re-ordering and disclosure, no content change, no hype).
**Impact 5 · Strategic 5 · Learning 4 · Confidence 4 · Effort 4 · Risk 2 → Priority = 12**

---

### 3. Entity hero stacks four "most important things" before the dimension data — `[SIMPLIFY]`

**Pages:** every entity detail page via `EntityDetail.tsx`.
**Problem:** Above the dimension bars, a reader passes through, in sequence: the AEO answer sentence (L431), the "If you remember one thing" callout (L442–478), the hero with band + rank + cohort line + band gloss + ScoreLegend (L480–569), the band-position strip (L572), the cohort rug <details> (L581), the sparkline + trend caption (L604), the evidence-review freshness stamp (L654), the assessment record card (L687), the tier-provenance chips (L693), and (sometimes) the floor disclosure (L733). That is **up to 10 distinct "orienting" components before the actual 8-dimension profile.** Several say nearly the same thing in different formats: the AEO sentence ("scores X/100, ranking #N of M") and the "If you remember one thing" head ("Ranks #N of M") and the hero rank line all restate rank. "One idea per unit" is violated — the page has three competing anchors and the reader cannot tell which is *the* takeaway.
**Proposed change:** Pick one anchor and demote the rest. Keep "If you remember one thing" as the single human-readable takeaway (it already merges rank + strongest/weakest + latest evidence + source — the richest of the three). Make the AEO sentence visually subordinate (it is for answer engines; keep it in the DOM but it should not read as a second headline — hand exact treatment to ux). Move cohort rug, sparkline, and tier chips into a single "Where this sits / how fresh" cluster rather than three separately-bordered sections. Collapse the freshness stamp + tier chips into one provenance line.
**Knowledge benefit:** The reader gets exactly one unmissable takeaway, then the profile, then evidence — a clean 5s→30s→3min ladder instead of a 10-component preamble.
**Independence-policy check:** PASS (no fabrication; consolidates existing real data).
**Impact 4 · Strategic 4 · Learning 4 · Confidence 4 · Effort 3 · Risk 2 → Priority = 11**

---

### 4. "Integration premium" is taught three different ways and never in one plain sentence first — `[SIMPLIFY + ELEVATE]`

**Pages:** home (`page.tsx` L314–318), methodology (`methodology/page.tsx` L409–421), entity detail (`EntityDetail.tsx` L893–966, `buildConsistencyCallout` L295–311).
**Problem:** The composite formula (`base + 10 × consistency × weakness`) is the most distinctive thing about the scoring — it is *why* a balanced 70/70 beats a spiky 90/40 — but it is introduced as jargon before it is explained. Home calls it "an integration adjustment that rewards consistency and penalizes active documented harm" (abstract). Methodology gives the std-dev gate table (correct but dense). The entity page shows `baseComposite + integrationPremium = composite` with a std-dev callout that assumes the reader already knows what "integration premium" means. Nowhere is there a single plain-language line a newcomer can hang the concept on. The mental model ("consistency is rewarded; one harm zeroes the bonus") never lands.
**Proposed change:** Author one canonical sentence — e.g. *"The score rewards consistency: an institution good at everything scores higher than one that's excellent at a few things and poor at others. Any single dimension at zero (documented active harm) cancels the bonus entirely."* — and reuse it verbatim everywhere the premium appears. On the entity page, lead the composite breakdown with this sentence *before* the `+` math. Keep the std-dev gate table as the deepest <details> rung only.
**Knowledge benefit:** The reader learns the single most teachable insight about the methodology once, in words, and recognizes it everywhere — a retention hook with repetition-and-variation.
**Independence-policy check:** PASS (clarification of existing rule, evidence-first).
**Impact 4 · Strategic 4 · Learning 5 · Confidence 4 · Effort 2 · Risk 1 → Priority = 14**

---

### 5. No site-wide "how to read this benchmark" primer — the schema is re-taught or assumed per page — `[ELEVATE]`

**Pages:** cross-cutting; symptom visible on `indexes/page.tsx`, `ai-labs/page.tsx`, entity pages, briefings.
**Problem:** The benchmark vocabulary (8 dimensions, 0–5 anchored scale, 5 bands with 0–100 ranges, composite, floor) is foundational, but a first-time visitor has no single 60-second on-ramp. Methodology is comprehensive but is a *707-line reference document* (`methodology/page.tsx`), not a primer — it opens with a 6-clause run-on sentence (L34) and a "Human Assessment Battery / ACB-HAB-001" panel (L46–74) that front-loads instrument-administration trivia before the reader knows what a dimension is. The bands are defined in three places with subtly different copy: `dimensions.ts BAND_DESCS` ("Your institution is at a critical stage…"), methodology L462–467 ("Active harm or fundamental compassionate failure"), and the `Band` component label. A reader cannot point to one canonical "what the words mean" surface.
**Proposed change:** Create a short, scannable **"How to read a Compassion score"** primer (one screen): the 8 dimensions as a labeled list, the 0–5 anchor ladder in one table, the 5 bands with their 0–100 ranges, and the one-sentence integration-premium line from finding #4. Link to it from every index hero, the entity ScoreLegend, and the top of methodology ("New here? Start with the 60-second primer"). Reorder methodology so the framework-overview section (currently L95–120) comes *before* the Human Assessment Battery instrument panel. Pick one canonical band-description string and use it in all three locations.
**Knowledge benefit:** A reader learns the schema once and carries it across the whole site; knowledge compounds instead of resetting per page. Cross-page coherence achieved.
**Independence-policy check:** PASS (consolidation; no new claims).
**Impact 5 · Strategic 4 · Learning 5 · Confidence 4 · Effort 3 · Risk 1 → Priority = 14**

---

### 6. Methodology hero buries the framework under instrument metadata and a wall-of-text intro — `[SIMPLIFY]`

**Pages:** `/methodology` (`methodology/page.tsx`).
**Problem:** The H1 is followed by a single 95-word sentence (L34) listing eight verbs, then a stats strip, then a side panel about document ID `ACB-HAB-001`, version `1.0`, companions `ACB-PAB-001 / ACB-STD-001`, and "Restricted assessor-use instrument" (L46–74) — none of which a reader needs to understand *how scores are produced*. The first thing the page should answer ("what is measured and how is it scored") is delayed behind administrative provenance. This is the authority document; its top is the least scannable part of the site.
**Proposed change:** Replace the 95-word lead with a 2-sentence answer ("The benchmark scores institutions on 8 dimensions of compassion, each on a 0–5 evidence-anchored scale, rolled into a 0–100 composite. Scores come from human assessment plus a nightly evidence pipeline, and every change is human-approved."). Move the ACB-HAB-001 instrument panel below the framework overview (or into a "the formal instrument" <details>). Lead with framework → scoring → evidence → safeguards; demote document IDs.
**Knowledge benefit:** A reader understands the methodology's shape in 15 seconds and can choose how deep to go; the instrument trivia stops being a gate.
**Independence-policy check:** PASS.
**Impact 4 · Strategic 4 · Learning 4 · Confidence 4 · Effort 2 · Risk 1 → Priority = 13**

---

### 7. Briefing-specific jargon ("boundary watch," "carry-forward," "floor conduct," "math hygiene") ships undefined — `[ELEVATE]`

**Pages:** `/updates/[date]` via `DailyBriefing.tsx` (Boundary watch L349; carry-forward L433/L983; floor conduct L1351; math hygiene L1465; "First baseline," "Watch" pills L970–989).
**Problem:** These are internal methodology terms surfaced as section titles and pills with no inline definition. "Math hygiene" (entities where published vs reconstructed composite diverge) is explained *in its own section description* (L1479) — good — but "boundary watch," "carry-forward +N," and "floor conduct" appear as colored pills/badges that a reader cannot decode. They look authoritative but teach nothing; worse, "carry-forward" and "floor" sound negative without context. Each undefined term is a comprehension tax on the brand's most evidence-dense surface.
**Proposed change:** Add a one-line gloss the first time each term appears per briefing (e.g. tooltip + a short parenthetical: "Boundary watch — flagged for possible future downgrade if a documented concern persists"). Better: a single shared "Briefing glossary" <details> at the foot, linked from each term, so the briefing teaches its own vocabulary. The "math hygiene" pattern (define-in-description) is the model to copy to the others.
**Knowledge benefit:** A reader can decode every badge they see; the briefing becomes self-teaching rather than insider shorthand.
**Independence-policy check:** PASS (definitions only).
**Impact 3 · Strategic 3 · Learning 4 · Confidence 4 · Effort 2 · Risk 1 → Priority = 11**

---

### 8. Index and home pages bury the *findings* under business-model copy — `[SIMPLIFY]`

**Pages:** `indexes/page.tsx`, home `page.tsx`.
**Problem:** The `/indexes` page devotes large sections to "Monetization model" (L185), "Index buyer paths" (a 4-column visitor×need×step×revenue table, L244–270), and "Recommended calls to action from index pages" (L279–286) — internal go-to-market framing exposed to the public reader. A researcher who came to *compare institutions* must scroll past revenue-path tables to find the indexes. Similarly the home page's strongest knowledge asset — "Today's research" with live score changes (L122–196) — sits *below* the hero's static publication-set table and competes for attention with 6 service cards, "who it's for," and two CTA callouts. The most learning-rich content (what actually moved, what the framework measures) is out-competed by sales scaffolding.
**Proposed change:** On `/indexes`, lead with the entity search + the 7 index cards (the findings), and demote/condense the monetization and buyer-path tables into a single "Using the benchmark commercially" section near the foot (hand exact CTA placement to conversion). On home, the "How the benchmark works" panel (the 8 dimensions, L299–322) should sit higher, immediately after the hero, so the reader learns *what compassion means here* before being sold services. This is a knowledge-priority call, not a CTA call — flag the revenue-table copy to conversion for a decision on public vs internal.
**Knowledge benefit:** Research-seeking readers reach the substance faster; the site reads as an authority first and a storefront second.
**Independence-policy check:** PASS (independence is *strengthened* by separating findings from sales framing).
**Impact 4 · Strategic 4 · Learning 3 · Confidence 3 · Effort 3 · Risk 2 → Priority = 9**

---

### 9. Entity dimension cards risk teaching the wrong thing (behavioral anchors ≠ this entity's scores) — `[SIMPLIFY]`

**Pages:** entity detail via `EntityDetail.tsx` L1079–1116 (#11 behavioral reference).
**Problem:** Each dimension card has a <details> titled "What {dim} measures · Level N reference" that lists the level-N anchor text for all 5 subdimensions, followed by a small-print disclaimer (L1111–1113) that this is "a level-N reference ladder, not a claim about {entity}'s subdimension scores." This is conscientious and independence-correct, but cognitively it is a trap: the reader sees five specific behavioral statements under a dimension this entity scored, say, 3.0 on, and will naturally read them *as descriptions of this entity* — exactly what the disclaimer says they are not. The disclaimer arrives after the misread has happened. It is a lot of reading for an idea ("a 3 looks roughly like this in general") that could be one example.
**Proposed change:** Reduce each level-N reference from five subdimension anchors to **one representative anchor sentence** for the dimension at that level, framed prospectively ("A score near 3 typically means: good-faith capacity in some cases, not yet consistent"). Lead with the framing, not the disclaimer. Keep the full 5-anchor ladder one rung deeper (link to methodology, which already has it at L524–573). This preserves the teaching value (what a level means) while removing the misattribution risk and the wall.
**Knowledge benefit:** The reader correctly learns "what a level means in general" without mistaking generic anchors for entity-specific findings — a cleaner, safer mental model.
**Independence-policy check:** PASS (reduces risk of implied unsupported claims).
**Impact 3 · Strategic 4 · Learning 3 · Confidence 3 · Effort 2 · Risk 2 → Priority = 9**

---

### 10. "Floor designation" — strong concept, but the reader meets the alarming visual before the plain definition — `[ELEVATE definition, keep gravity]`

**Pages:** entity detail `EntityDetail.tsx` L733–848; briefing `DailyBriefing.tsx` floor sections; methodology L262–324 (well-explained there).
**Problem:** On an entity page, a floor-designated entity shows a large red gradient section titled "Composite score resolves at zero — methodology disclosure" with primary-driver dimension chips and an evidence bullet list *before* the reader has a one-line definition of what "floor" means. The plain definition is at the *bottom* of the box (L832–844). The methodology page explains it excellently (the math floor, the 4 trigger criteria, exit conditions) — but that context lives one click away. A reader who lands directly on a floored entity (e.g. from a briefing link) meets the gravity before the explanation, which reads closer to alarm than to evidence-first teaching.
**Proposed change:** Move the one-line definition ("Floor = every dimension at the lowest evidence anchor; the composite math then resolves to 0. Reversible when documented improvement appears.") to the *top* of the disclosure box, above the evidence pattern. This is purely re-ordering existing copy. The red treatment and evidence detail stay (the gravity is earned by the evidence) — but the reader is taught *what they're looking at* first.
**Knowledge benefit:** Definition-before-evidence ordering keeps the strongest, most independence-sensitive feature on the right side of "teaching, not alarmism."
**Independence-policy check:** PASS — actively improves the evidence-first / not-alarmist posture.
**Impact 3 · Strategic 4 · Learning 3 · Confidence 4 · Effort 1 · Risk 1 → Priority = 12**

---

## Simplify vs Elevate — summary

| # | Finding | Call | Priority |
|---|---------|------|----------|
| 1 | Ranking-table acronym columns get a legend + tooltips | **ELEVATE** | 17 |
| 4 | One plain-language "integration premium" sentence, reused | SIMPLIFY + ELEVATE | 14 |
| 5 | Site-wide "how to read a score" primer + canonical band copy | **ELEVATE** | 14 |
| 6 | Methodology hero leads with framework, not instrument IDs | SIMPLIFY | 13 |
| 2 | Daily briefing gets a "Today in 30 seconds" tier; collapse 13–18 | SIMPLIFY | 12 |
| 10 | Floor definition moves to top of the disclosure box | ELEVATE | 12 |
| 3 | Entity hero: one anchor, demote the duplicate rank restatements | SIMPLIFY | 11 |
| 7 | Briefing glossary for boundary-watch / carry-forward / floor / math-hygiene | ELEVATE | 11 |
| 8 | Index/home lead with findings, demote monetization tables | SIMPLIFY | 9 |
| 9 | Dimension cards: one framed anchor, not five misreadable ones | SIMPLIFY | 9 |

---

## If you fix one thing

**Add a dimension legend + score-band reference to every ranking table (Finding #1).** It is the highest-traffic, most-shared, most-cited surface; it currently fails the 5-second test outright with 8 undefined acronym columns; the data already exists in `DIMENSIONS`; and a single shared `<DimensionLegend />` component fixes all 7 indexes at once with near-zero risk. It is the cheapest possible move that most directly serves the founder's goal of being the clear, go-to authority — because right now the authority's flagship data grid is unreadable on first contact.

**Cross-cutting thread:** findings #1, #4, #5, #7 are all one underlying move — *define the vocabulary once, in plain language, and reuse it everywhere.* A shared `<DimensionLegend />`, a shared `<ScoreBandReference />`, one canonical integration-premium sentence, and a briefing glossary would resolve the majority of the site's jargon debt and make knowledge compound across pages instead of resetting.

---

## Handoffs

- **UX (pixels):** visual treatment of the dimension-legend strip (#1); subordinating the AEO sentence vs the "remember one thing" anchor (#3); collapsing the entity hero's provenance cluster (#3); briefing "Today in 30 seconds" block styling (#2).
- **Dataviz (chart grammar):** none required for these findings; radar/sparkline/deviation-bar *grammar* is out of scope here — only their *placement in the disclosure ladder* is flagged (#3).
- **Conversion (CTAs/pricing):** decision on whether the `/indexes` monetization model, buyer-path table, and "recommended CTAs" copy should be public-facing at all (#8); placement of demoted commercial sections.
