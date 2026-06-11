# Graphics Review — /updates Briefing
**PM lens | 2026-06-11**

Scope: which graphics most increase reader value, trust, citability, and shareability; evidence-image strategy and policy; connection across briefings, entity pages, Special Briefings, and social OG cards.
Does NOT cover: visual design, component implementation, deployment.

---

## Evidence base

- `CLAUDE.md` — independence policy
- `docs/DAILY_BRIEFING_SCHEMA.md` — full rich contract v1.0 including EvidenceItem atom
- `docs/BRIEFING_EVIDENCE_BACKLOG_2026-06-11.md` — F1/F2 waves; evidence[] now shipping
- `docs/UPDATES_BACKLOG2_2026-06-10.md` — Wave C/D consolidated backlog; sparklines and OG image proposed
- `docs/UPDATES_REVIEW2_PM_2026-06-10.md` — round-2 PM review with scored candidates
- `docs/UPDATES_REVIEW2_COMPETITIVE_2026-06-10.md` — comparator table and scored mechanics
- `docs/BRIEFING_EVIDENCE_PM_2026-06-11.md` — evidence-data PM review; EvidenceLedger is data-starved
- `site/src/data/updates/daily/2026-06-08.json` — live briefing with evidence[] on UAE/topSignals
- `site/src/components/updates/briefing/ScoreSparkline.tsx` — Wave C sparkline component (built)
- `site/src/components/entity/CompositeSparkline.tsx` — entity-page sparkline (built)
- `site/src/components/updates/briefing/EvidenceLedger.tsx` — built but data-starved; reads evidence[]
- `site/src/data/dimensions.ts` — 8 dimensions × 5 subdimensions × 5 anchors
- `site/public/data/history/*.json` — per-entity history JSON (100+ slugs present)

---

## Class definitions

**Class A — Data-derived graphics** (own scores, dimensions, bands, history — safe, citable, shareable)
The benchmark fully owns this data. These graphics are reproducible from internal JSON at build time. They carry no copyright, no provenance chain, and no fabrication risk. They are the graphics the benchmark can put its name on and that journalists embed.

**Class B — Evidence images** (photos, satellite imagery, screenshots, third-party visuals from sources)
The benchmark does not own these. They carry copyright (editorial and commercial licensing), provenance requirements, and fabrication risk. They require a distinct policy.

---

## Candidate Graphics

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**
Each dimension scored 1–5.

---

### G1 — Score-Over-Time Sparkline on Lead Signal Card

**Class:** A (data-derived)

**Problem / opportunity:**
The briefing has zero visual layer as of Wave B. Every briefing entry — including band-crossing days like June 8 (UAE −5.0, Developing → Critical) — is entirely text. `ScoreSparkline.tsx` was built as Wave C item #3 but is not yet wired into the briefing's `LeadSignalCard.tsx` or `ScoreMovementCard.tsx`. The history JSON exists for 100+ slugs in `site/public/data/history/`. Band boundaries are at 20/40/60/80 and already encoded in the component as gridlines. Band-crossing events are already flagged as larger yellow dots. The component is a static-export-safe inline SVG with no charting dependency.

The UAE June 8 band crossing (23.4 → 18.4) is the exact case where a sparkline carrying a visible drop across the Developing/Critical gridline conveys in one glance what 340 words of prose convey at length.

**Proposed change (product scope only):**
Wire `ScoreSparkline` (compact mode, 120×32px) into `LeadSignalCard` for the top signal whenever `severity: critical` or a `delta` is non-zero. Wire into `ScoreMovementCard` for each `recentAssessments` row. Add a "Chart of the Day" module on band-crossing days: the lead entity's full-size sparkline (200×52px) with band labels, positioned after the headline and before the evidence cards. Add copy-embed and copy-citation affordances (OWID model — plain HTML snippet + citation text).

**Value:**
- Trust: a visual of historical scores makes the claim "this entity has trended down for six cycles" auditable at a glance.
- Citability: embed-ready SVG is the Economist/OWID model for earned media — journalists can drop it into articles.
- Shareability: the "Chart of the Day" on a band-crossing day is a natural social object.
- Cross-surface: wiring the same sparkline to entity pages (already done via `CompositeSparkline`) creates visual continuity briefing → entity.

**Independence/integrity/licensing check:** PASS. The graphic renders only the benchmark's own scored data. No third-party asset. No copyright. No fabrication risk. The data is immutable at publish time and fully traceable to the internal scoring record.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **16** |

---

### G2 — Band-Distribution Bar as the Benchmark's Signature Visual

**Class:** A (data-derived)

**Problem / opportunity:**
The benchmark covers 1,160 entities across 5 bands. No existing page surface shows where those 1,160 entities sit in aggregate. The briefing's header describes individual movements but never shows the shape of the whole benchmark. On confirmation-heavy days (June 10: zero score changes, 17 confirmations), there is nothing memorable or shareable — the briefing currently shows a grey placeholder.

A horizontal bar divided into 5 colored segments (Critical / Developing / Functional / Established / Exemplary) — with count labels and color tokens from `globals.css` (`band-red`, `band-orange`, `band-yellow`, `band-green`, `band-blue`) — is the benchmark's "state of the world" visual. It is computable from the 7 index JSON files at build time. It updates any day a score crosses a band boundary. It is the graphic that is unique to this institution (no other benchmark shows 1,160 entities across governments, corporations, AI labs, and robotics labs in a single band view).

**Proposed change (product scope only):**
Build a static `BandDistributionBar` component, computed at build time from the index JSON files. Place it in the briefing header on all days. Surface the same bar (with sector breakdown: countries / Fortune 500 / AI labs / robotics labs / cities) as a standalone graphic on a `/benchmark/snapshot` page. Add a copy-image affordance for social sharing. Use it as the briefing's fallback "visual of the day" on confirmation-heavy cycles when no score changes occurred.

This is also the natural visual for the benchmark's "about" and "methodology" pages — it answers "what does the benchmark actually show?" in one image.

**Value:**
- Trust: the distribution bar contextualizes every individual score (Oracle at 20.6 is near the Critical boundary — visible against the full distribution).
- Shareability: a single image showing that X% of governments sit in the Critical band is the social post.
- Citability: journalists and researchers can embed a bar that shows the global compassion distribution across institution types.
- Quiet-day problem: this is the answer to the empty-visual problem on non-band-crossing days.

**Independence/integrity/licensing check:** PASS. Derived entirely from the benchmark's own index data. No third-party assets. Updates only when scores change, which is traceable to internal scoring records.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **15** |

---

### G3 — Per-Entity Dimension Profile (Radar / Bar on Entity Pages)

**Class:** A (data-derived)

**Problem / opportunity:**
Every entity in the indexes has 8 dimension scores (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT) each ranging 1–5. These are in the index JSON. No entity page currently surfaces them as a visual — only the composite score is shown prominently. A researcher looking at UAE's entity page after the June 8 downgrade sees 18.4 Critical, but cannot see that INT and ACC each dropped to 1.2 while BND held at 3.0 — the nuance that distinguishes "UAE as corrupt domestic state" from "UAE as external genocide co-sponsor with intact domestic service capacity."

A horizontal bar profile per dimension (8 rows, each 1–5 with the band-boundary at 3.0 marked) is readable, accessible, and informative in a way no competitor provides for cross-sector entities. It also makes the dimension system — 8 dimensions × 40 subdimensions — visible to readers who would otherwise never discover it.

**Proposed change (product scope only):**
Add a dimension-profile visual to entity pages (`renderEntityPage.tsx`), positioned after the composite score and before the evidence card. 8 horizontal bars, one per dimension, colored by the dimension's token color from `dimensions.ts` (AWR=#7dd3fc, EMP=#c084fc, etc.). Mark the band-boundary gridline at score 3.0. On the briefing's `LeadSignalCard`, surface a mini version (compact, 4 bars for the dimensions that changed) when `dominantDimension` is present in `recentAssessments`.

Cross-surface effect: the dimension profile on the entity page becomes the visual destination for the briefing's "dominantDimension: INT, delta: −0.3" note.

**Value:**
- Trust: shows the methodology's analytical depth — not a single black-box number but a structured profile across 8 observable dimensions.
- Citability: a researcher can cite "INT 1.2, ACC 1.2" as specific scored claims with source links.
- Cross-surface: creates a compelling reason to navigate from the briefing → entity page to see the full dimension breakdown.

**Independence/integrity/licensing check:** PASS. Derived from the benchmark's own scored dimension data. The dimension scores are part of the published index JSON and are fully traceable.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |
| **Priority** | **14** |

---

### G4 — Per-Briefing OG Social Card (Auto-Generated)

**Class:** A (data-derived)

**Problem / opportunity:**
Every `/updates/[date]` page has OG metadata but no `og:image`. When shared on LinkedIn, X, or in Slack, the link renders as a plain text card. On June 8 (UAE Developing → Critical, −5.0), a compelling OG card would carry: entity name, band badge (Critical, red), score change (−5.0), index label, and the benchmark wordmark. This is the single highest-leverage shareability change — a 2–3× lift in social share CTR is the established benchmark for OG image presence vs. absence.

The Cloudflare Worker is already deployed. Satori (the Vercel OG image library) renders React-like JSX to PNG in a Worker context. The briefing JSON is public at `public/data/updates/daily/YYYY-MM-DD.json`, reachable from the Worker. The competitive review confirmed this as a Wave D item.

**Proposed change (product scope only):**
Add a `/og/updates/:date` endpoint to the Cloudflare Worker. It reads the briefing JSON, selects: `topSignals[0]` entity name + severity color, `recentAssessments[0]` delta + band badge, cycle type, and the date. Renders a 1200×630 PNG: dark background (benchmark theme), lead entity + score change + band badge on left, a mini sparkline SVG path on right (from history JSON), benchmark wordmark bottom-right. Point `og:image` at the Worker URL from the briefing page's metadata.

Extend the same pattern to Special Briefings (`/updates/special/`) — same Worker endpoint, different template (larger entity name, thematic framing).

**Value:**
- Shareability: the primary driver. A journalist tweeting the UAE briefing link gets a card showing "UAE: 23.4 → 18.4 | Developing → Critical" with the benchmark's brand.
- Citability: the OG card is an embed in media articles (screenshot of the card with credit).
- Cross-surface: links from entity pages to briefings will also pick up the OG card for entity-page social shares.

**Independence/integrity/licensing check:** PASS. The OG card renders only the benchmark's own data (scores, bands, entity names). No third-party imagery. No licensing issue. The Worker endpoint generates the card at request time from the public JSON, making it fully traceable.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **12** |

---

### G5 — Longitudinal Sector Trend Chart (Weekly / Special Briefing)

**Class:** A (data-derived)

**Problem / opportunity:**
The briefing currently has no chart that shows a sector's movement over time. The history JSON for 100+ entities and the daily briefings' `recentAssessments` records exist across 4+ weeks of data. A "Fortune 500 health insurers — composite average over 12 weeks" line chart, or a "Countries in Critical band — count over time" area chart, is a graphic that no competitor publishes for these sector groups.

This is most valuable in Special Briefings (sector-level deep dives) and in the proposed "This Week in Compassion" weekly synthesis. It is less appropriate in a daily briefing where the reading budget is constrained. On a week where UnitedHealth, Cigna, Oracle, and 3M are all in active enforcement situations, a sector trend chart for Fortune 500 health insurers would be the anchor visual.

**Proposed change (product scope only):**
Reserve longitudinal sector charts for Special Briefings and the weekly synthesis (Wave D). In the daily briefing, limit to sparklines at entity level (G1). Define the sector chart as a labeled build-time SVG (same pattern as ScoreSparkline but across multiple entities). Data: aggregate `recentAssessments[].assessed` values per sector from the 30-day briefing archive. The chart is the natural centerpiece for a "health insurance sector under pressure" or "AI labs approaching EU AI Act deadline" Special Briefing.

**Value:**
- Trust: sector trends distinguish signal from noise — a single entity's score change is less significant than a pattern across a sector.
- Shareability: a sector chart is a natural "Chart of the Week" social artifact for the weekly synthesis.
- Special Briefing anchor: sector trend charts are the visual hook that justifies a paid Special Briefing as distinct from the daily flow.

**Independence/integrity/licensing check:** PASS. Derived from the benchmark's own scored data across the 30-day archive. Fully traceable. Sector groupings are objective (Fortune 500 = the published Fortune list; AI labs = the benchmark's 50-lab index).

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 1 |
| **Priority** | **12** |

---

### G6 — Source Tier Badge in EvidenceLedger

**Class:** A (data-derived, with evidence metadata)

**Problem / opportunity:**
The `EvidenceLedger` component is built and deployed. The `EvidenceItem` schema (shipped Wave F1) now carries `sourceTier: 1|2|3|4|5`. The June 8 UAE briefing's `topSignals[0].evidence[]` has three items with `sourceTier: 4`, `2`, `3` respectively. The EvidenceLedger already has `TIER_LABELS` and `TIER_COLORS` constants in `evidence/index.tsx` and renders a tier badge in `EvidenceCard` when `sourceTier` is present.

The gap is the product decision about what "Tier 1: Gov/Court/Treaty" means visually and editorially — specifically, making the tier hierarchy legible to a non-specialist reader. The EvidenceLedger currently shows the badge but does not explain the tier system inline. A reader seeing "Tier 2" next to an Amnesty International source does not know whether Tier 2 is better or worse than Tier 3.

**Proposed change (product scope only):**
Add a legend to the EvidenceLedger (collapsible, below the section title): five rows explaining each tier, matched to the methodology's own definitions. Ensure that the June 8 UAE evidence — the UN Fact-Finding Mission citation (should be Tier 1, currently showing as Tier 4 because the source is Al Jazeera reporting on the FFM) — is re-tiered to reflect the underlying institutional source, not the media carrier. Define a rule: tier reflects the originating institution (UN FFM = Tier 1), not the publication that reported it.

**Value:**
- Trust: making tier hierarchy explicit in the EvidenceLedger turns it into a quality-graded source table, not just a link list.
- Citability: a Tier 1-anchored finding is citable in ways a Tier 4 finding is not — readers need to know which is which.
- This is a "visual" in the sense that the tier badge is the primary graphic element of the EvidenceLedger.

**Independence/integrity/licensing check:** PASS. The tier system is the benchmark's own methodology. Applying it consistently strengthens independence — it prevents score changes from resting on Tier 4/5 evidence without that being visible in the public ledger.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **13** |

---

### G7 — Forward-Trigger Countdown Visual

**Class:** A (data-derived)

**Problem / opportunity:**
The briefing's `forwardTriggers[]` array carries hard-dated events: Oracle/June 15, 3M/July 31, EU AI Act/August 2. These are currently rendered as a text list. The competitive review identified the CreditWatch-style countdown (proximity-colored, entity + trigger + days remaining) as the single most differentiated mechanic vs every comparator. Adding a visual countdown bar (entity name + trigger description + days remaining, colored red/amber/green by proximity) makes the forward-trigger section scannable and shareable.

The "days remaining" is computable at build time from `forwardTriggers[].date` vs. the build date. The color band (red = 0–7 days, amber = 8–30 days, green = 30+ days) is a simple build-time rule.

**Proposed change (product scope only):**
Render `forwardTriggers[]` as a visual countdown list rather than a prose list: each trigger shown as a row with a proximity color indicator, entity name, trigger description, and "N days" label. Hard dates sorted before TBD items. On days where a hard-date trigger fires (today is the named date), flag it as "triggered — awaiting scoring decision." This is the product definition for `ForwardTriggerCountdown.tsx` (already exists as a component — verify it implements the visual behavior described here).

**Value:**
- Trust / accountability: the countdown is the benchmark holding itself accountable to its own predictions.
- Return mechanic: readers return to see whether the Oracle June 15 trigger fires. This is the best low-investment daily-return driver.
- Shareability: a "5 days until Oracle's WARN Act trigger" is a social object for labor, corporate governance, and ESG audiences.

**Independence/integrity/licensing check:** PASS. Forward triggers are documented events from public record (court filings, regulatory deadlines, legislation). They are published as the benchmark's analytical anticipation, not as a commitment to score a specific outcome. The trigger fires when a scoring event occurs — the entity cannot pay to suppress or advance the trigger date.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **14** |

---

### G8 — Own-Generated Maps and Geospatial Context Cards

**Class:** A (data-derived, own-generated)

**Problem / opportunity:**
Several of the highest-severity briefing signals have a geographic dimension: UAE arms flow to Sudan via Libya/Chad/Uganda (June 8), DRC Ebola across 17 of 36 Ituri health zones, Russia bombardment targeting patterns. None of the current briefing graphics surface geography.

The benchmark should not use third-party satellite images, press photos, or news outlet maps (see Evidence-Image Policy section below). However, it CAN generate its own schematic maps from public geographic data (country boundaries from public domain GeoJSON, no third-party imagery). A schematic map showing UAE → Sudan arms flow (labeled arrows, named countries, no satellite imagery) is entirely benchmark-generated.

**Proposed change (product scope only):**
Define a class of "benchmark-generated schematic geography cards" for use in Special Briefings and high-severity daily signals. These are SVG-based, not raster-image-based. They use public domain country outline data (Natural Earth, CC0 license). They carry the benchmark's visual style (dark theme, band colors). They are generated at build time or by the research agent as SVG files committed to the repo. No satellite imagery, no news photos, no editorial images.

Scope for the daily briefing: schematic maps are appropriate only in Special Briefings or on band-crossing days with a geographic component (4–6 times per year). They are not a daily graphic.

**Value:**
- Trust: a benchmark-generated schematic is more defensible than a news photo — the benchmark draws exactly what the evidence says, nothing more.
- Special Briefing anchor: a Sudan/UAE schematic map is a compelling visual centerpiece for the Special Briefing on the ACTIVE-COMPLICITY-IN-MASS-ATROCITY-BY-PROXY ruling.
- Shareability: a labeled schematic with the benchmark's branding is more likely to be credited when re-published than a licensed press photo.

**Independence/integrity/licensing check:** CONDITIONAL. The schematic must only represent what the benchmark's scored evidence says — arm flows that are documented, not alleged. The schematic must carry a caption stating its evidential basis and the specific source. Public domain GeoJSON (Natural Earth CC0) removes licensing risk for the geographic base layer. No satellite imagery, no editorial photos. Risk is low if the rule is: schematic, benchmark-generated, evidence-captioned only.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 2 |
| **Priority** | **8** |

---

### G9 — Verbatim Quote Pullquote as a "Graphic" Unit

**Class:** A with Class B metadata (own-framed; third-party text)

**Problem / opportunity:**
The Wave F1/F2 evidence work ships the `EvidenceItem` schema with `quote` (verbatim, ≤50 words), `source`, `url`, and `sourceTier`. The June 8 UAE briefing already has three evidence items on the lead signal with verbatim quotes: "They formed part of a planned and organised operation that bears the defining characteristics of genocide" (UN FFM chair, via Al Jazeera). This is a graphic unit — a styled blockquote with attribution, tier badge, and source link is visually distinct from body prose and is the most shareable text element in a briefing.

The `EvidenceQuote` component exists in `evidence/index.tsx` and is used in `EvidenceLedger`. It is not yet wired into `LeadSignalCard` or the briefing's above-the-fold section.

**Proposed change (product scope only):**
Wire `EvidenceQuote` into `LeadSignalCard` for the top signal when `evidence[0].quote` is present and `severity: critical`. Position it between the signal title and the analytical description. This requires no new component — it is a data wiring change (the component exists, the data now exists for the June 8 UAE briefing and future briefings). The pullquote is the "graphic" element that represents Class B content handled in a Class A way: the benchmark frames the quote but does not host any image.

**Value:**
- Trust: a verbatim quote from the UN FFM chair is more credible than a paraphrase of it. It anchors the claim in language that a third party wrote.
- Shareability: a pull-quoted sentence attributed to an institutional source is the most naturally shareable element — it is the text equivalent of a chart.
- Citability: journalists can quote the pullquote with attribution to both the primary source and the benchmark's surface.

**Independence/integrity/licensing check:** PASS with conditions. Verbatim quotation of factual statements from published institutional sources (UN, ICJ, Amnesty, HRW) for the purpose of commentary and analysis is fair use / fair dealing in all relevant jurisdictions. The `url` field (required by the schema integrity guard) links to the primary source, preventing misattribution. The risk is paraphrase-as-quote — mitigated by the build-gate length ceiling and the explicit "verbatim, exact text" rule in the schema. This is already enforced as a build ERROR if quote is present without url.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **16** |

---

## Priority Matrix

| # | Title | Class | Priority | Independence |
|---|---|---|---|---|
| G1 | Score-Over-Time Sparkline on Lead Signal | A | **16** | PASS |
| G9 | Verbatim Quote Pullquote as graphic unit | A + fair use | **16** | PASS (conditional) |
| G2 | Band-Distribution Bar (signature visual) | A | **15** | PASS |
| G3 | Per-Entity Dimension Profile | A | **14** | PASS |
| G7 | Forward-Trigger Countdown Visual | A | **14** | PASS |
| G6 | Source Tier Badge in EvidenceLedger | A | **13** | PASS |
| G4 | Per-Briefing OG Social Card | A | **12** | PASS |
| G5 | Longitudinal Sector Trend Chart | A | **12** | PASS |
| G8 | Own-Generated Schematic Maps | A (CC0 base) | **8** | CONDITIONAL |

---

## Evidence-Image Policy

### The policy question

Should the benchmark host third-party images — photographs, satellite imagery, screenshots from news outlets — in the briefing or on entity pages?

### Findings

**The copyright exposure is material and asymmetric.** Editorial photographs (e.g., press agency images of conflict, satellite imagery from Planet Labs or Maxar, screenshots of news articles) are protected works. "Fair use" for a digital publication that also sells commercial products (Score-Watch subscriptions, research packages) is substantially harder to defend than for a purely non-commercial educational use. Press agencies enforce licensing actively. A single DMCA takedown or licensing claim against a benchmark institution damages credibility in ways that no image benefit could offset.

**The provenance and fabrication risk is higher than for data graphics.** The independence policy in CLAUDE.md states: "Entities never pay for inclusion, score changes, or suppression of findings." A photograph of a conflict zone or a corporation's facility introduces a selection question: which image, selected by whom, for what reason? A benchmark institution that shows a flattering versus unflattering image of the same entity creates an editorial exposure that is inconsistent with the scored-data-only independence model. This risk does not exist for data-derived graphics because the graphic renders what the score says, not what an image implies.

**The fabrication and manipulation risk is acute for AI-assisted evidence pipelines.** The brief notes that F1/F2 evidence work just shipped. The integrity guard ("quote must have url") protects verbatim text. There is no equivalent guard for image authenticity — an AI-assisted pipeline that retrieves images from URLs cannot reliably verify that the image matches the described event, that metadata is intact, or that the image has not been staged. For a benchmark whose credibility rests on "every score traces to a primary source," an unverifiable image is a liability, not an asset.

**Own-generated data graphics solve the same problems without the risks.** The sparkline of UAE's score declining from 23.4 to 18.4 communicates "this entity moved into a worse band" more precisely and more citeably than a photograph of Sudanese civilians, which communicates only human distress and raises questions about selection, context, and the benchmark's role in humanitarian storytelling (which is not its function).

**The verbatim quote pullquote (G9) is the correct Class B substitute.** The benchmark already has — and has built integrity guards around — the ability to surface verbatim text from institutional sources (UN, Amnesty, HRW). A styled blockquote with attribution and source link provides the "human anchor" effect that photographs are sometimes expected to provide, without copyright exposure, without fabrication risk, and with better citability. The UN FFM chair's sentence ("bears the defining characteristics of genocide") is more credible than any photograph precisely because it is sourced to an institutional finding.

### Policy recommendation: Link-only for third-party images; own-generated only for hosted graphics

**Tier 1 — Own-generated, hosted:** Data-derived SVG graphics (sparklines, band-distribution bar, dimension profiles, OG cards, schematic maps from CC0 geodata). These are the benchmark's intellectual property, carry no licensing risk, and are reproducible from internal data. These are the graphics the benchmark publishes under its own name.

**Tier 2 — Verbatim text as graphic substitute:** Pull-quoted verbatim statements from institutional sources (UN, ICJ, WHO, Amnesty, HRW) with attribution and URL, displayed as styled blockquotes. This is fair use for commentary, is already schema-enforced, and provides the "human anchor" function that a photograph would otherwise serve.

**Tier 3 — Link-only, never hosted:** Third-party photographs, satellite imagery, screenshots, editorial images, news outlet visuals. The benchmark links to these via `evidence[].url` and `archivedUrl` — it directs readers to the source, it does not republish the image. No third-party image is served from the benchmark's domain or CDN. This is the same model used by citation-first academic and institutional publications.

**Tier 4 — Explicitly prohibited:** AI-generated imagery (even if used to "illustrate" a conflict), staged or stock photography presented as documentary, screenshots not traceable to a specific URL in the evidence record, any image for which the benchmark cannot demonstrate either: (a) a clear CC0/CC-BY license, or (b) own-generation from public domain data. The integrity guard model that enforces "quote requires url" should be extended to any future image field: "image requires license-classification and source-url" as a build check.

### Why this policy strengthens rather than limits the benchmark

An institution whose evidence layer consists entirely of: (1) own-generated data graphics with immutable source data, (2) verbatim quotes from institutional sources with verified URLs, and (3) links to primary sources — cannot be credibly attacked for image selection bias, copyright infringement, or fabricated evidence. The policy is not a concession; it is a competitive positioning. The benchmark's graphics moat is its data, not its photography.

---

## Cross-Surface Connection (briefings ↔ entity pages ↔ Special Briefings ↔ social)

| Surface | Graphics role |
|---|---|
| Daily briefing — lead signal | G9 (quote pullquote) + G1 (sparkline, compact) + G7 (trigger countdown) |
| Daily briefing — assessment cards | G1 (sparkline, per entity) + G6 (tier badge in evidence ledger) |
| Daily briefing — header / quiet days | G2 (band-distribution bar) |
| Entity pages | G3 (dimension profile) + G1 (full sparkline, already `CompositeSparkline`) |
| Special Briefings | G5 (sector trend chart) + G8 (schematic map, when evidence warrants) + G3 (multi-entity dimension comparison) |
| Social sharing | G4 (OG card, auto-generated per briefing) + G2 (band-distribution bar as standalone) |
| Methodology changelog | G6 (tier badge legend) + ruling application counts (text, not graphic) |

---

## Highest-Leverage Graphics Investment

The two highest-priority graphics (G1, G9) are both low-effort items that act on already-built infrastructure:

**G1 (Score-Over-Time Sparkline, Priority 16):** `ScoreSparkline.tsx` is already built and tested. History JSON exists for 100+ slugs. Wiring it into `LeadSignalCard` and `ScoreMovementCard` is the single change that transforms the briefing's visual identity. The "Chart of the Day" module on band-crossing days is the natural social object and the most direct answer to the "briefing has zero visual layer" gap identified by three independent lens reviews.

**G9 (Verbatim Quote Pullquote, Priority 16):** `EvidenceQuote` is already built in `evidence/index.tsx`. The June 8 UAE briefing already has three `evidence[]` items with verbatim quotes and URLs. Wiring `EvidenceQuote` into `LeadSignalCard` for critical/high signals is a data-wiring change that requires no new component, no new schema, and no new data. It makes the briefing immediately more citable and shareable — and it is the correct substitute for third-party imagery under the evidence-image policy.

These two items together (estimated combined effort: 3–4 frontend hours once components exist) would visually transform the June 8 UAE briefing from a text-only analysis into a brief with: a historical sparkline showing the 23.4 → 18.4 crossing, and the UN FFM chair's verbatim sentence as a styled pullquote. That is the minimum viable "show your work visually" layer.

**G2 (Band-Distribution Bar, Priority 15)** is the highest-value net-new build — a graphic that is genuinely unique to this institution and solves the quiet-day problem. It is the benchmark's "signature visual" that no comparator offers.

---

## Evidence-Image Policy Verdict

**Do not host third-party images. Link to them only.**

Own-generated data graphics (Tier 1) and verbatim-quote pullquotes (Tier 2) provide all the visual and human-anchor value that third-party images would provide, without the copyright exposure, provenance risk, fabrication risk, or independence compromise. This is not a limitation — it is a differentiator. The benchmark's graphics should be indistinguishable from its data: reproducible, traceable, independently verifiable, and fully owned.
