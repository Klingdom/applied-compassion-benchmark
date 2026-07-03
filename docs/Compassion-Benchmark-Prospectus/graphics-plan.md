# Graphics Plan: Compassion Benchmark Funder Prospectus

**Owner:** Data-Visualization / Layout Architect.
**Governs:** every visual in the 60 to 70 page prospectus.
**Sources of truth:** `plan/04-graphics-layout-plan.md` (full visual system and hero briefs), `chapters/appendix-F-graphics-and-layout-system.md` (the in-manuscript reference), `docs/BRAND_VISUAL_IDENTITY.md` (palette and type), `site/src/data/dimensions.ts` (dimension colors and band scale), `source_notes.md` (all numeric content).

**Design north star:** forensic gravity. A precise instrument applied to a human subject. Serious, calm, credible, human. Not charity, not ESG software, not an academic wall of text. One non-negotiable rule governs every visual: **every graphic must be reproducible from Compassion Benchmark's own scored data or its published methodology. Nothing is decorative.** A chart that cannot be rebuilt from the index data or the methodology does not belong in the document.

---

## 1. Locked color and type tokens

These bind every graphic in this plan. Confirm with the founder before final SVG build, because they govern roughly thirty placements.

**Brand / link / accent:** blue `#3b82f6` (primary), deep `#1d4ed8` (gradient anchor, hover), tint `#93c5fd` (links and accent on dark surfaces). Blue is the only general accent, in print as well as on screen.

**Cyan `#7dd3fc` is reserved and dual-purpose, never a general accent.** It carries exactly two encoded meanings and they never collide in practice: in the five-band score scale it means the **Exemplary** band; in the eight-dimension palette it is the identity color of **AWR / Awareness**. It is never used for links, buttons, headings, focus glows, or decoration. Any other accent need is served by blue. (This dual reservation traces to `dimensions.ts`, where AWR is `#7dd3fc`, and to the band scale, where Exemplary is `#7dd3fc`. The two contexts are visually separated: dimension cyan appears only on dimension labels, wheel spokes, and the AWR icon; band cyan appears only in score bands. Flag this for founder confirmation.)

**Five-band score scale (warm to cool, red as harm):**

| Band | Range | Screen / dark | Print / light surface |
|---|---|---|---|
| Critical | 0 to 20 | `#f87171` | `#dc2626` |
| Developing | 20 to 40 | `#fb923c` | `#ea580c` |
| Functional | 40 to 60 | `#fcd34d` | `#ca8a04` |
| Established | 60 to 80 | `#86efac` | `#16a34a` |
| Exemplary | 80 to 100 | `#7dd3fc` | `#0284c7` |

Use the dark band ramp only on the cover, the six Part dividers, and full-page hero graphics on the navy field. Use the light-surface ramp on every off-white body page so bands survive on paper. Run a CMYK-safe check on the light ramp before any physical print run.

**Eight-dimension palette (from `dimensions.ts`):**

| Code | Dimension | Color |
|---|---|---|
| AWR | Awareness | `#7dd3fc` |
| EMP | Empathy | `#c084fc` |
| ACT | Action | `#86efac` |
| EQU | Equity | `#fcd34d` |
| BND | Boundaries | `#fb923c` |
| ACC | Accountability | `#f472b6` |
| SYS | Systemic Thinking | `#34d399` |
| INT | Integrity | `#a78bfa` |

**Colorblind redundancy (non-negotiable on every chart):** band label and left-to-right position always present, a monotonic luminance ramp legible in grayscale, and a hatch `<pattern>` on the Critical band in dense charts. Red Critical and green Established collapse under deutan and protan vision, so they may never be distinguished by color alone.

**Type:** DM Sans 700 for headings and display; a humanist body face (serif or sans) with generous leading for running text; tabular numerals in every table and chart. Spacing on a 4px base.

---

## 2. Cover image recommendation

**Concept: the Calibrated Arc over a human field.**

A dark navy field (`#0b1220` ramping to `#1a2a46`). The brand's calibrated measurement arc sits as a quiet hero: a graduated arc (gauge, protractor, scale = measurement) that simultaneously reads as an open, palm-up form (offering, regard = compassion), with a single **pivot dot** at its center. The pivot dot is the one human at the heart of everything measured; it does the human work a photograph would otherwise do, copyright-clean.

The full five-band sequence appears **once**, as a thin graduated red-to-cyan hairline, stating the whole 0 to 100 scale before a word is read. Title set large in DM Sans 700: "Compassion Benchmark," with the subtitle "Building the Global Standard for Measuring Institutional Compassion" and the line "A Strategic Vision, Research Prospectus, and Funding Opportunity."

**Deliberately not:** no stock photography, no waiting-room or clinician photo, no glowing networks, no AI purple, no abstract data swarm. The brand imagery stance is data diagrams only. This resolves the older `08-layout` suggestion of a literal human photograph toward the brand's no-photography rule: typography plus the band hairline plus the pivot dot carry the human-and-measurement tension. The cover is the single most important brand object in the document; restraint is the authority signal.

`role="img"` alt equivalent for the tagged PDF: "Compassion Benchmark. A graduated measurement arc with a single center pivot dot, above a thin five-band color scale running from red, the Critical band, to cyan, the Exemplary band."

---

## 3. Section divider concepts (one per Part, six total)

A consistent template builds rhythm; a rotating dimension color signals a new movement. Each divider is a full-bleed dark navy page carrying: the Part number set very large, the Part title, one dimension-colored motif drawn from the eight-dimension palette, and one sharp pull-quote attributed to the methodology, not a person.

| Part | Title | Motif color and form | Pull-quote on the divider |
|---|---|---|---|
| I | Why Compassion Needs a Standard | AWR cyan `#7dd3fc`, the concentric signal-arc motif (detection) | "Mission statements are not evidence." |
| II | The Standard | the full eight-color dimension ring | "At institutional scale, compassion is not a feeling. It is a pattern of decisions." |
| III | Research Foundation | SYS green `#34d399`, the root-tree motif (structure) | "High performance when it is easy is not evidence of institutional character." |
| IV | Applications | ACT green `#86efac`, the forward-chevron motif (response in the field) | "The question is whether care survives process, pressure, scale, incentives, and time." |
| V | Public Benefit | EQU gold `#fcd34d`, the balanced-beam motif (shared, fair language) | "A score only matters if it becomes a shared language." |
| VI | Building the Institution | INT violet `#a78bfa`, the plumb-line-under-load motif (consistency under cost) | "Independence locked, not promised." |

Note for the designer: Parts III and IV both use a green motif (SYS `#34d399` and ACT `#86efac`). They are distinct greens and the rotating *form* differs, but if the two dividers will be seen in quick succession during proofing, confirm the contrast holds; otherwise the rotation reads as a repeat. This follows the plan's rotation as the source of truth.

---

## 4. Eight-dimension icon system

Eight simple line icons, one per dimension, each in its `dimensions.ts` color, drawn on a shared 24-by-24 grid with a consistent 2px stroke and round caps. These are line marks, not illustrations. Built once, reused roughly thirty times as dimension-section bullets, the eight-dimension wheel spokes (Chapter 6 and Appendix A), and sidebar markers. Deliver as a single SVG sprite.

| Code | Dimension | Color | Icon concept (line mark) |
|---|---|---|---|
| AWR | Awareness | `#7dd3fc` | Concentric signal arcs radiating from a small dot. Detection before naming. |
| EMP | Empathy | `#c084fc` | Two offset profile curves overlapping. Perspective-taking. |
| ACT | Action | `#86efac` | A forward chevron resolving into an open, palm-up hand. Response and movement. |
| EQU | Equity | `#fcd34d` | A balanced beam with two unequal-sized pans leveled. Fair-to-need, not equal-to-all. |
| BND | Boundaries | `#fb923c` | A bracket or guardrail with a deliberate gap. Consent, scope, sustainable limit. |
| ACC | Accountability | `#f472b6` | A circular return-arrow over a baseline. Repair and course-correction. |
| SYS | Systemic Thinking | `#34d399` | A branching root or node tree. Root cause and interconnection. |
| INT | Integrity | `#a78bfa` | A plumb-line holding straight under a downward load. Consistency under cost. |

Each icon must be legible at 16px (sidebar marker) and at 64px (wheel spoke). Color is never the only cue; the form alone must read, because these sit beside band-colored charts where a second cyan or green would otherwise confuse.

---

## 5. Hero graphics (the seven that carry the argument)

Each hero has a single reader question and a plain-language takeaway title baked into the SVG (the Burn-Murdoch rule: the title states the point, the chart proves it). All seven are full-page or near-full-page, hand-rolled inline SVG, exported as standalone vectors.

### H1. "We measure everything except this" (the standards matrix). Chapter 3

- **Reader question:** Why is there an independent standard for finance, safety, cyber, and environment, but none for whether institutions reduce suffering?
- **Chart type:** horizontal matrix. Rows are domains of institutional performance: Financial integrity, Product safety, Cybersecurity, Environmental and labor conduct, Quality, AI capability and safety, and finally Treatment of suffering. Columns: *What is measured*, *By whom*, *Public standard exists*. Every row reads "yes" down the columns until the final row, which reads "no, no, no" in Critical red, then resolves with the Compassion Benchmark mark filling the missing cell.
- **Data:** `source_notes §1` problem statement; `§9` comparables. Named domains and exemplars only; no fabricated scores.
- **The aha:** the accountability vacuum is structural and obvious, and the benchmark is the missing instrument. **This is the single most persuasive page in the document.** It also reappears, compressed, in Chapter 4.
- **Density:** full-page hero. Give it air; one idea per spread.
- **Alt text:** carries the full matrix as a sentence, ending "every domain has an independent public standard except the treatment of suffering, which has none."

### H2. Evidence-hierarchy pyramid. Chapter 7, Appendix B

- **Reader question:** How do you know a score is not public relations?
- **Chart type:** five-tier pyramid, narrow apex to broad base. Tier 1 independent audit at the apex, Tier 5 entity self-report at the base; width encodes abundance, vertical position encodes trust. One real example source type per tier. The visual encodes that the strongest evidence is the rarest and the weakest the most abundant.
- **Data:** `source_notes §3` five tiers, verbatim.
- **The aha:** "mission statements are not evidence" made visual. The credibility anchor the whole document leans on.
- **Caveat to honor:** do not print numeric per-tier weights or a formal tier-to-confidence mapping (flagged [VERIFY] in Appendix B). Show the ordering and the rule "strong scores require stronger evidence," not invented coefficients.
- **Density:** full-page hero in Chapter 7; reference grid in Appendix B.

### H3. Theory-of-change logic model. Chapter 22

- **Reader question:** What does funding actually cause?
- **Chart type:** left-to-right five-stage flow, Inputs to Activities to Outputs to Outcomes to Impact, with the four stated **assumptions** shown as a footed band beneath the arrows, placed exactly where the chain depends on actors outside the institution.
- **Data:** `source_notes §9` causal pathway and four assumptions, verbatim.
- **The aha:** a fundable causal chain, honestly hedged. Assumptions are shown, not hidden.
- **Caveat:** assumptions are labeled as assumptions, never as facts; no achieved-impact claim anywhere on the diagram.

### H4. Nightly-pipeline workflow swimlane. Chapter 25, Appendix C

- **Reader question:** Is this real and durable?
- **Chart type:** swimlane. Four automated lanes flowing in sequence (scanner, then assessor, then digest), then a **visually distinct human-gate lane** for the score-updater. Per-stage runtime and cost annotated: scan about 30 min / about $2; assess about 2.25 hr / about $25 to $60; digest about 5 min / about $0.50; human-gated update / no auto-run. A footer band shows total nightly cost about $27.50 to $62.50 and the two-plane firewall separating assessment from commercial.
- **Data:** `source_notes §5` four-stage pipeline; `§4` lifecycle.
- **The aha:** continuous coverage of 1,256 institutions for the price of a working dinner a night. Near-zero marginal cost per added entity is the leverage story funders reward.
- **Caveat:** the human-gate lane must be visually unmistakable as human-triggered, never auto-run. Do not inflate planned capabilities into present tense.

### H5. Roadmap timeline. Chapter 27

- **Reader question:** When does what happen, and when is independence locked?
- **Chart type:** horizontal timeline across twelve months in three phase bands (0 to 3, 3 to 6, 6 to 12 months). Fixed-deadline items pinned as hard marks: Schmidt Sciences, August 8, 2026; Fast Forward window, July 30 to September 8, 2026. Soft milestones (Form 1023 filed, IRS determination received, board constituted, integrity audit fully automated, first outside citation) placed in their phases but visually marked as **targets, not guarantees**. A faint "Year 2+" extension past month 12 carries scope-expansion and staffing triggers as conditions, not dates.
- **Data:** `source_notes §9` formation; `§10` phases.
- **The aha:** concrete near-term milestones with real, dated deadlines. Momentum, not vapor.
- **Caveat:** the two leading-indicator milestones (IRS determination, first outside citation) are honestly marked as the ones that cannot be willed onto a fixed date.

### H6. Funding-package cards. Chapter 29, Appendix E

- **Reader question:** What exactly am I funding?
- **Chart type:** three tier cards side by side. Seed ($150k / 12 months), Core ($300k / 12 to 18 months), Multi-year ($500k+ / 2 to 3 years). Each card lists its matched funder tier, the line items it covers, and the named KPIs it makes possible. Above the cards, a compact three-tier funder-pipeline diagram (Tier 1 accessible now, Tier 2 mid-size thematic, Tier 3 relationship-gated) with the fixed deadlines pinned. Footer: all asks are sized to funder ranges and imply no commitments.
- **Data:** `source_notes §10` ask sizes and KPIs; Appendix E.
- **The aha:** a clear, sized ask with deliverables. Removes friction from the decision.
- **Caveat:** "imply no commitments" must be visible on the graphic; no funder named here has committed.

### H7. Impact and KPI dashboard. Chapter 23

- **Reader question:** How will we know it worked?
- **Chart type:** a KPI dashboard mock in two columns, Year 1 and Year 2 targets, grouped under three headers: OUTPUTS, OUTCOMES, INDEPENDENCE. Each outcome row shows a "baseline: 0 reported" tag beside its target, so the distance between what exists and what is promised is visible at a glance.
- **Data:** `source_notes §10` KPIs; impact framed as forward-looking.
- **The aha:** measurable accountability for the organization itself. The benchmark holds itself to a standard.
- **Caveat:** every KPI is forward-looking; baseline external citations are 0; never present a projection as achieved.

**Supporting heroes that build cleanly** from the chapter set: the eight-dimension wheel (Chapter 6, Appendix A), the two-plane independence diagram (Chapter 26), the recognize-respond-reduce loop (Chapter 5), and the revenue-mix donut beside the cost-base bar (Chapter 28).

---

## 6. Evidence-hierarchy graphic (detail)

Covered as H2 above. Built as a five-band stepped pyramid. Each band: tier number, tier name, one real source type. Apex (Tier 1, rarest, strongest) in the highest-luminance treatment; base (Tier 5, most abundant, weakest) in the lowest. Pair every band with its label and its vertical position so the ordering survives grayscale. Carry the rule "strong scores require stronger evidence" as the takeaway title. No numeric weights.

## 7. Theory-of-change graphic (detail)

Covered as H3 above. The five stages are equal-width blocks joined by arrows; the assumptions band runs beneath, tied by thin leaders to the exact arrows where outside actors must behave as assumed (for example, between Outputs and Outcomes, where a journalist or regulator must choose to cite). Color the stage blocks in a single neutral blue family (`#3b82f6` tints), never band colors, so the diagram is not misread as a score.

## 8. Platform workflow graphic (detail)

Covered as H4 above. The single most important encoding choice: the three automated lanes share one visual treatment (a cool neutral), and the human-gate lane is set apart (a distinct fill plus a small human/approval marker), so a reader grasps in one second that a person stands between the machine and the public score. Runtime and cost sit as small annotations under each lane; the firewall footer is a thin vertical rule labeled "enforced by separated credentials and write-protected files, not policy."

## 9. Roadmap timeline graphic (detail)

Covered as H5 above. Encoding discipline: fixed deadlines are solid pins; soft milestones are open/hollow markers with a one-word "target" tag, so the eye never mistakes an aspiration for a commitment. The "Year 2+" zone fades to signal lower certainty. No Gantt bars implying precise durations the plan does not have.

## 10. Funding-package graphic (detail)

Covered as H6 above. Three cards of escalating commitment, left to right, with a subtle size or weight step so the eye reads Seed to Core to Multi-year as a climb. Each card's KPI list uses the same KPI vocabulary as H7 so the two graphics reinforce each other. The funder-pipeline strip above ties each card to its tier.

## 11. Impact framework graphic (detail)

Covered as H7 above. The three-header grouping (Outputs, Outcomes, Independence) mirrors the theory-of-change stages, so a reader who saw H3 recognizes the structure. The "baseline: 0 reported" tags are the honesty device and the most important elements on the graphic; they must be legible, not buried.

---

## 12. Data-visualization candidates from real, honest data

Buildable now from the index JSONs, static-export-safe inline SVG, no implied precision. These are the Part IV and Executive-Summary evidence assets.

- **Band distribution across 1,256 entities** (Front 5, Chapter 3, Chapter 18). A single stacked/segmented bar, or small-multiples per index, showing the share of entities in each of the five bands. Honest, aggregate, own data. Mirrors the live `BandDistributionBar`.
- **Sector comparison strip** (Chapter 18). A ranked dot/strip per index (Countries, Fortune 500, Cities, AI Labs, Robotics, Universities) on one 0 to 100 axis with band zones shaded. Answers "compared to what?"
- **Universities worked example** (referenced in chart principles). Mean 46.2, zero Exemplary, prestige-compassion gap (USC 36.7 lowest, Harvard 52.3 highest). A small ranked bar with the confidence-flag caveat noted. Real, citable, striking.
- **Fortune 500 composite histogram** (Chapter 17). Magnitude across the five bands, zero-baseline bars.
- **Country ranked-bar excerpt** (Chapter 16) and **AI / robotics leaderboard excerpt** (Chapter 14). Band-colored, top and bottom slices only, labeled.

**Precision flags. Do not over-encode:**

- **Never plot a trend line or sparkline of composite history in the prospectus.** Public scores are young and the pipeline applies changes only at a delta of 5 or more. A trajectory would imply longitudinal precision the data does not have. State movement in words.
- **Floor scores** (Israel 0.0, Sudan 0.0, UnitedHealth Group 10.2) are floor or near-floor designations, not fine-grained measurements. Annotate as such; never imply 0.0 versus 0.4 resolution.
- **Integration-premium math** is shown as a conceptual callout only ("a balanced 70/70 profile out-earns a spiky 90/40 profile"), never as a precise curve.
- **Any single entity's eight-dimension radar** must carry the area-misleads caveat and be read as a *shape*, not a measurement. Prefer the dimension-profile bar wherever possible (this is why Chapter 9's before/after is grouped bars, not a radar).

---

## 13. Recommended chart style

Honest, restrained, own-data, static-export-safe. The rules:

- Zero baselines on all magnitude bars; truthful axes; no cherry-picked ranges.
- Band color carried with **label and left-to-right position** every time, plus monotonic luminance and a Critical-band hatch in dense charts. Never color alone.
- Tabular numerals everywhere. No chartjunk, no 3D, no drop shadows on data marks.
- **No pie charts** except the single revenue-mix donut in Chapter 28.
- Every chart gets a plain-language takeaway title and an alt-text caption that carries the numbers, for the accessible tagged PDF.
- Hand-rolled inline SVG, no chart libraries, following the site's chart philosophy (server-rendered SVG strings, the `BandDistributionBar` / `BandPositionStrip` / `DimensionProfileBar` family). Vectors stay crisp at A4 and Letter.
- Document every caveat on the graphic: floor versus near-floor, small-N history, radar-area-misleads, integration-premium as concept not curve. Misleading encoding is an integrity failure for a benchmark.

---

## 14. Suggested pull quotes

Six divider quotes (one per Part, listed in §3 above) plus a reserve set pulled from the assembled manuscript for callout pages and the funder summary. All are specific and sharp; none could belong to a generic brochure.

**The six Part-divider quotes:**
1. "Mission statements are not evidence."
2. "At institutional scale, compassion is not a feeling. It is a pattern of decisions."
3. "High performance when it is easy is not evidence of institutional character."
4. "The question is whether care survives process, pressure, scale, incentives, and time."
5. "A score only matters if it becomes a shared language."
6. "Independence locked, not promised."

**Reserve pull quotes from the manuscript** (attribute to the methodology or the document, not a person):
- "The claim that independent accountability at this scale is impractical is no longer available, because the impractical part is the part that already exists." (Chapter 24)
- "The instrument runs tonight. The institution is what these months build around it." (Chapter 27)
- "Most independence claims are assertions. This one is a property of the architecture." (Chapter 26)
- "The firewall is physical before it is procedural." (Chapter 25)
- "An institution that rounds up its own audit status has already started down the road it claims to be guarding against." (Chapter 26)
- "Philanthropy here buys durable independence rather than a permanent subsidy." (Chapter 28)
- "These are conditions the organization imposes on its funders, in writing, and the funders worth having are the ones who read that as the point rather than an obstacle." (Chapter 29)
- "Compassion Benchmark monitors 1,256 institutions every working night and publishes the results for free, for roughly the price of a working dinner a night." (paraphrase of Chapter 25/28; verify exact wording before setting as a quote)

Set pull quotes large, left-aligned, in DM Sans, with the dimension icon of the host Part as a small marker. Use sparingly: at most one per spread, ideally on the divider and on dedicated reflection pages.

---

## 15. Suggested sidebar concepts

Sidebars clarify, they do not decorate. Each is marked with the relevant dimension icon. One register per Part:

- **Part I (definitions).** What "suffering-treatment" means; why "the gap is measurement, not malice." Marked with the AWR icon.
- **Part II (methodology notes).** The 0 to 5 anchors; the +10 integration-premium cap; the pressure-test cap at the Developing anchor; "human-gated, never hand-assessed at scale." Marked with the relevant dimension icon per page.
- **Part III (cautionary limitations).** The attribution and subject rule; floor versus near-floor; "sentiment is not scored." Marked with the SYS icon.
- **Part IV (short worked examples).** UnitedHealth Group 10.2 Critical; the Universities mean 46.2 with zero Exemplary; the country floor cases. Marked with the host chapter's sector cue.
- **Part V (funder implications).** What changes if the theory of change holds; what is genuinely free versus paid. Marked with the EQU icon.
- **Part VI (governance notes and how to use the benchmark).** The supermajority bylaw; the no-single-funder-above-10% rule; how a journalist, regulator, or board reads a score. Marked with the INT icon.

Keep sidebars short, boxed, and visually quieter than the body. Never let a sidebar carry a load-bearing claim that is not also in the running text.

---

## 16. Graphic-to-chapter map

Every `[GRAPHIC]` call in `compassion-benchmark-funder-prospectus.md`, in document order, with its spec, data source, and chart treatment. Hero graphics are tagged H1 to H7.

| # | Location | Graphic | Type / encoding | Data source | Density / page treatment |
|---|---|---|---|---|---|
| 1 | Front 1 (Cover) | Cover arc + band hairline | Calibrated arc, pivot dot, single five-band hairline, on navy | Brand mark; band scale | Full-bleed cover |
| 2 | Front 2 (Inside cover) | Independence-pledge lock device | The independence pledge set verbatim inside a bordered "lock" frame | GRANT_MODEL independence statement (verbatim) | Quiet full page |
| 3 | Front 3 (Mission) | Typographic triptych | Mission / Vision / Core belief as three short declarations across one spread | source_notes §1; ORGANIZATION_PLAN §2 | Spacious reflection spread |
| 4 | Front 5 (Exec summary) | "At a glance" infographic | Five stat blocks: 1,256 entities, 8 dimensions, 40 subdimensions, 5 evidence tiers, $150k to $300k ask | source_notes §§1,2,5,7,9,10 | Anchors the summary spread |
| 5 | Front 6 (How to read) | Six-part navigation diagram | Parts I to VI as a reader path, the inherited question at each step | chapter-index | Half page |
| 6 | Ch1 | Decision-ripple spot illustration | One institutional decision at center rippling outward to the people it reaches (claim, letter, family on the phone) | source_notes §1 (illustrative, framed as such) | Chapter opener spot |
| 7 | Ch2 | Quote-vs-conduct split panel | Left "What the institution says" (values language); right "What the evidence shows" (scored conduct); the gap is the argument | source_notes §1 | Two-column device |
| 8 | **Ch3 (H1)** | **"We measure everything except this" matrix** | Rows = domains; columns = What is measured / By whom / Public standard exists; all yes until the suffering row reads no, then the mark fills it | source_notes §1, §9 | **Full-page hero, the most persuasive page** |
| 9 | Ch4 | Existing-frameworks comparison table | Rows = ESG, rights/wellbeing indices, audits/certs, internal ethics codes, AI-ethics statements, Compassion Benchmark; columns = answers well / independence / breadth / openness; bottom row alone marked across all four | source_notes §1, §9; STRUCTURE Part 2 | Dense table page |
| 10 | Ch5 | Recognize-respond-reduce loop | Three linked stages around a return arrow, each labeled with its plain question, the loop closing on itself | source_notes §2 | Half-page diagram |
| 11 | Ch6 | Eight-dimension wheel | Eight colored arcs forming a ring, each labeled code + name + one-line question, canonical AWR to INT order, dimension colors, cyan only on AWR | source_notes §2; dimensions.ts | Full-page hero (HIGH density) |
| 12 | **Ch7 (H2)** | **Five-tier evidence pyramid** | Apex Tier 1 independent audit to base Tier 5 self-report; width = abundance, height = trust; one real source type per tier | source_notes §3 | **Full-page hero** |
| 13 | Ch8 | 0 to 5 anchor strip | Six labeled steps left to right (0 Active Harm set apart, then 1 Absent to 5 Exemplary) with behavioral descriptions | source_notes §3, §4; methodology-v1.2 §1 | Half page (HIGH density) |
| 14 | Ch8 | Composite-formula callout | Two-line equation set large: base = ((mean of 8 − 1) / 4) × 100, then final = base + integration premium (0 to +10), with the illustrative lab's numbers substituted | source_notes §3; methodology-v1.2 §1 | Callout block, the single most important device |
| 15 | Ch9 | Before/after dimension-profile bar | Grouped bars across the eight dimensions (not a radar); "after" lifts four weak dimensions toward 4.0, leaves two strong ones flat | source_notes §3, §4 | Half page; radar-area caveat noted |
| 16 | Ch10 | Behavioral-evidence ladder | Four ascending rungs: Sentiment, Policy, Conduct, Verified Outcome; height is what counts; a source can appear on more than one rung | source_notes §2, §4 | Half-page diagram |
| 17 | Ch12 | Root-cause vs symptom-relief diagram | Two response paths from one recurring harm; one loops back to the harm, the other branches upstream where SYS is scored | source_notes §2 | Half-page diagram |
| 18 | Ch13 | Before/after pressure-test bar | Left bar favorable evidence, mean 4.0 Established; right bar after the cap on subdimensions lacking a costly case, mean 3.2 Developing; the drop is the gate | source_notes §4 | Half page |
| 19 | Ch14 | AI / robotics leaderboard excerpt | Entity rows with band-colored composite scores, AI Labs index beside Robotics Labs index | source_notes §6, §10 (own data) | Data-viz; verify any named lab score |
| 20 | Ch15 | UnitedHealth Group entity card | Annotated card: composite 10.2, Critical band, eight dimension scores, evidence-tier provenance behind the lowest | source_notes §8; methodology-v1.2 §3 | Card; defamation review (HIGH) |
| 21 | Ch16 | Country ranked-bar excerpt | Band-colored ranked bars of country composites, zero baseline, own data | source_notes §6 (own data) | Data-viz; floor cases annotated |
| 22 | Ch17 | Fortune 500 histogram | Composite scores distributed across the five bands, zero baseline, own data | source_notes §6 (own data) | Data-viz |
| 23 | Ch18 | Sector-spread panel | Eight live indexes plus the planned civil-society extension on one axis, the eight dimensions on the other; framework is sector-agnostic | source_notes §2, §6 | Panel; mark civil society as planned |
| 24 | Ch19 | Lingua-franca diagram | One composite score at center, four lines to journalist, investor, policymaker, affected community, each annotated with what the number lets them do | source_notes §9 | Half-page diagram |
| 25 | Ch20 | Public-index page mock + open methodology | Left mock public index page (ranked, band colors, marked "free"); right the open method (formula, anchors, tiers, marked "published"); a thin "reconstructable" line links one score to the formula | source_notes §5, §8 | Two-panel spread |
| 26 | Ch21 | Four-audience usage map | Four quadrants (journalist, policymaker, researcher, community) around a central badge-endpoint node; arrows both ways, community feeding evidence in | source_notes §5, §8, §10 | Half-page diagram |
| 27 | **Ch22 (H3)** | **Theory-of-change logic model** | Five stages Inputs to Impact, with four assumptions as a footed band beneath the arrows | source_notes §9 | **Full-page hero** |
| 28 | **Ch23 (H7)** | **KPI dashboard mock** | Two columns Year 1 / Year 2, grouped OUTPUTS / OUTCOMES / INDEPENDENCE, each outcome row tagged "baseline: 0 reported" | source_notes §10 | **Full-page hero (HIGH, all forward-looking)** |
| 29 | Ch24 | Built-vs-planned status board | Two columns "Built and operating" beside "Designed or in rollout," deliberately near-equal length | source_notes §5, §6; CLAUDE.md | Full page; honesty is the point (HIGH) |
| 30 | **Ch25 (H4)** | **Nightly-pipeline swimlane** | Four automated lanes (scanner, assessor, digest) plus a distinct human-gate lane; per-stage runtime/cost; footer nightly cost $27.50 to $62.50 and the two-plane firewall | source_notes §5, §4 | **Full-page hero (HIGH)** |
| 31 | Ch26 | Two-plane independence diagram | Assessment plane vs commercial plane with a hard firewall ("separated credentials and write-protected files, not policy"); three stacked bands Engineered (built) / Legal (planned) / Governed (planned) | source_notes §7 | Full-page hero (HIGH) |
| 32 | **Ch27 (H5)** | **Roadmap timeline** | Twelve months, three phase bands; fixed pins (Schmidt Aug 8 2026; Fast Forward Jul 30 to Sep 8 2026); soft milestones marked as targets; faint "Year 2+" extension | source_notes §9, §10 | **Full-page hero** |
| 33 | Ch28 | Revenue-mix donut + cost-base bar | Donut: three legs (grants majority, earned revenue, small donors) with "no single funder >10%" note; bar: seven cost lines bracketed at $200k to $330k; both labeled "Year 1 model, projected, not booked" | source_notes §8, §10 | Two-graphic spread (HIGH) |
| 34 | **Ch29 (H6)** | **Funding-package cards** | Three cards Seed / Core / Multi-year with matched funder tier, line items, named KPIs; three-tier funder-pipeline strip above; "imply no commitments" footer | source_notes §10 | **Full-page hero (HIGH)** |
| 35 | Ch30 | Closing dimension-ring spread | The eight-dimension ring over a dark field with the five-band hairline, echoing the cover to close where the document opened | source_notes §1, §9 | Full-bleed closing spread |

**Appendix graphics** (reference, not new heroes): Appendix A, the full 8-by-5 dimension-and-subdimension reference grid, color-coded; Appendix B, the evidence pyramid with example sources per tier (the H2 build reused); Appendix C, the lifecycle swimlane (automated lane beside human-gate lane, the H4 build reused); Appendix D, the governance safeguard checklist table (rule, comparable source, strength); Appendix E, the three funding-tier cards (the H6 build reused); Appendix F, the style tile (palette, type scale, chart and badge components).

---

## 17. Production note (summary; full pipeline in `layout-notes.md`)

Two tracks. The Markdown to styled HTML to headless Edge print-to-PDF pipeline is the continuous-proof track and can produce credible early grant attachments and the short funder summary now. The flagship 60 to 70 page final goes to a designer in Affinity Publisher or InDesign. Hand off: the clean final Markdown; a graphics folder of named final-vector `.svg` files, one per hero and each data-viz, each with its takeaway title baked in; `layout-notes.md`; the brand tokens with the light-surface band ramp; and the eight-dimension icon set as a single SVG sprite. Export every graphic as a standalone vector so the designer places vectors, not screenshots.

---

## 18. Count of distinct graphics specced

- **35** `[GRAPHIC]` placements called in the manuscript (mapped in §16), of which **7** are designated hero graphics (H1 to H7).
- **6** Part section dividers (§3), a distinct deliverable from the 35.
- **1** eight-dimension icon system comprising **8** individual line marks (§4), reused roughly thirty times.

**Total distinct graphic deliverables: 49** (35 manuscript graphics + 6 dividers + 8 dimension icons). Several appendix visuals reuse hero builds rather than adding new art, as noted in §16.
