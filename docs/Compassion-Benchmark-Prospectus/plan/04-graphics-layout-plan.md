# 04 — Graphics & Layout Plan (Funder Prospectus)

**Owner:** Data-Visualization / Layout Architect. Seeds the eventual `graphics-plan.md` + `layout-notes.md`. Governs all visuals in the 60–70pp prospectus. Source of truth for data: `source_notes.md`; for palette/type: `BRAND_VISUAL_IDENTITY.md`; for dimension colors: `dimensions.ts`.

Design north star (from `08-layout-and-design.md` + brand brief): **forensic gravity** — a precise instrument applied to a human subject. Serious, calm, credible, human. Not charity, not ESG-SaaS, not academic wall-of-text. Every graphic must be reproducible from our own scored data; nothing is decorative.

---

## 1. The Visual System

**Cover concept — "The Calibrated Arc over a human field."** Dark navy field (`#0b1220`→`#1a2a46` ramp). The brand mark (the graduated measurement arc with center pivot dot) sits as a quiet hero, and the 5-band red→cyan sequence appears once as a thin graduated hairline — the whole 0–100 scale stated before a word is read. Title set large in DM Sans 700. No glowing networks, no AI purple, no stock photography (brand rule: imagery stance is *none — data diagrams only*). The "human" is carried by the cover **subtitle line** and the pivot dot (the single person at the heart of measurement), not a photo. This keeps us copyright-clean and on-brand vs. the `08-layout` suggestion of a literal waiting-room photo — we resolve toward the brand's no-photography stance and let typography + the band hairline do the human/measurement work.

**Section dividers (one per Part, six total).** A consistent template: full-bleed dark page, the Part number set large, the Part title, and **one dimension-colored motif** drawn from the eight-dimension palette rotating across Parts (I→AWR cyan, II→the full 8-color ring, III→SYS green, IV→ACT green, V→EQU gold, VI→INT violet). Each divider carries one sharp pull-quote (see §4). The repetition builds rhythm; the rotating color signals "new movement."

**Eight-dimension icon system** — simple line icons (not illustrations), one per dimension, each in its `dimensions.ts` color, drawn on a shared 24×24 grid with consistent 2px stroke:

| Dim | Color | Icon concept (line mark) |
|---|---|---|
| AWR Awareness | `#7dd3fc` | concentric signal arcs radiating from a small dot (detection before naming) |
| EMP Empathy | `#c084fc` | two offset profile curves overlapping (perspective-taking) |
| ACT Action | `#86efac` | an arrow resolving into an open hand / forward chevron (response) |
| EQU Equity | `#fcd34d` | a balanced beam with unequal-sized pans leveled (fair-to-need) |
| BND Boundaries | `#fb923c` | a bracket / guardrail with a gap (consent, scope, sustainable limit) |
| ACC Accountability | `#f472b6` | a circular return-arrow over a baseline (repair, course-correct) |
| SYS Systemic Thinking | `#34d399` | roots/branching node tree (root cause + interconnection) |
| INT Integrity | `#a78bfa` | a plumb-line / load under downward pressure holding straight (consistency under cost) |

Icons reused as: dimension-section bullets, the eight-dimension wheel spokes (Ch6 / Appendix A), and sidebar markers. One build, ~30 placements.

**Color & typography.** Adopt the brand tokens verbatim. **Critical fix is mandatory in print too:** brand/link/accent color is **blue** (`#3b82f6` / tint `#93c5fd`), never cyan — cyan (`#7dd3fc`) means *only* "Exemplary." Band sequence: Critical `#f87171` → Developing `#fb923c` → Functional `#fcd34d` → Established `#86efac` → Exemplary `#7dd3fc`, warm→cool, red = harm. For print/PDF use the **light-surface band ramp** (Critical `#dc2626` … Exemplary `#0284c7`) on warm off-white pages so bands survive on paper; reserve the dark navy field for cover, dividers, and full-page hero graphics only. Colorblind redundancy is non-negotiable: every band carries its **label + left→right position**, monotonic luminance, and a hatch `<pattern>` on Critical in dense charts. Type: DM Sans 700 headings; a humanist body serif or sans with generous leading; strong hierarchy; numerals tabular in all tables/charts.

**White-space & page rhythm.** 4px spacing base. Deliberate variation (per `08-layout`): full-page chapter openers → two-column narrative → a full-page hero graphic roughly every 6–8pp → callout/reflection page → dense methodology/table page → back to air. Never two dense pages adjacent. Generous margins; one idea per spread in the narrative parts.

---

## 2. Signature (Hero) Graphics — Design Briefs

| # | Graphic | Reader question | Chart type / encoding | Data behind it | The "aha" |
|---|---|---|---|---|---|
| H1 | **"We measure everything except this"** | If we audit finance, safety, cyber, environment — why not suffering? | Horizontal matrix: rows = domains (Financial, Safety, Cybersecurity, Environmental/ESG, Human-rights); columns = "Has independent standard? / Audited? / Comparable? / Public?" — all green checks — then a final **Compassion** row of red gaps, ending with our mark filling it. | `source_notes §1` problem statement; §9 16-comparables (narrow/siloed/capturable/paywalled). Named exemplars only, no fabricated scores. | The vacuum is structural and obvious; we are the missing instrument. **This is the single most persuasive page in the document.** |
| H2 | **Evidence hierarchy pyramid** | How do you know a score isn't PR? | 5-tier pyramid, T1 (independent audit) at apex → T5 (self-report) at base; width = trust, with example sources per tier and the rule "strong scores require stronger evidence." | `source_notes §3` (5 tiers verbatim). | "Mission statements are not evidence" made visual — credibility in one glance. |
| H3 | **Theory of change / logic model** | What does funding actually cause? | Left→right 5-stage flow: Inputs → Activities → Outputs → Outcomes → Impact, with stated **assumptions** as a footed band beneath. | `source_notes §9` (full causal pathway + 4 assumptions verbatim). | A fundable causal chain, honestly hedged — assumptions shown, not hidden. |
| H4 | **Platform / nightly pipeline workflow** | Is this real and durable? | Swimlane: automated plane (scanner → assessor → digest) flowing into a **human-gate** lane (score-updater, human-triggered only); cost-per-night annotation (~$27–62/night; ~1,256 entities). | `source_notes §5` 4-stage pipeline; §4 lifecycle. | Near-zero marginal cost per entity at scale = the leverage story funders reward. |
| H5 | **Five-year roadmap timeline** | When does what happen; when is independence locked? | Horizontal timeline with maturity gates: fiscal sponsor → Form 1023 → determination; grant deadlines (Schmidt Aug 8 2026, Fast Forward window) marked as fixed pins. | `source_notes §9` formation; §10 phases A–D. | Concrete near-term milestones with real, dated deadlines — momentum, not vapor. |
| H6 | **Funding-package menu** | What exactly am I buying? | Three tier cards: $150k Seed / $300k Core / $500k+ Multi-year, each mapped to deliverables + the KPIs it funds. | `source_notes §10` ask sizes + KPIs; Appendix E. | A clear, sized ask with deliverables — removes friction from the decision. |
| H7 | **Impact framework / KPI dashboard** | How will we know it worked? | Output→Outcome→Impact ladder beside a KPI panel (entities scored, citations, score-change events, subscribers) with **Year-1 vs Year-2 targets**, baseline honestly marked "0 reported" where true. | `source_notes §10` KPIs; §12 (impact is forward-looking). | Measurable accountability for the org itself — we hold ourselves to a standard. |

Supporting heroes from chapter-index also build cleanly: **eight-dimension wheel** (Ch6/App A), **two-plane independence diagram** (Ch26), **recognize→respond→reduce loop** (Ch5), **revenue-mix donut + cost-base bar** (Ch28), **existing-frameworks comparison table** (Ch4).

---

## 3. Data-Viz Candidates from Real, Honest Data

Buildable now from index JSONs (`meta.entityCount` + scored composites), static-export-safe SVG, no implied precision:

- **Band distribution across 1,256 entities** — a single stacked/segmented bar (or small-multiple per index) showing the share in each of the 5 bands. Honest, aggregate, our own data. (Mirrors live `BandDistributionBar`.) Strong Executive-Summary and Part IV asset.
- **Sector comparison strip** — ranked dot/strip per index (Countries, F500, Cities, AI Labs, Robotics, Universities) on one 0–100 axis with band zones shaded. Answers "compared to what?"
- **Universities worked example** — mean 46.2, **zero Exemplary**, prestige–compassion gap (USC 36.7, Harvard 52.3 highest). A small ranked-bar with the confidence-flag caveat noted. Real, citable, striking.
- **F500 composite histogram** across the 5 bands (Ch17) — magnitude, zero-baseline bars.
- **Country ranked-bar excerpt** (Ch16) and **AI/robotics leaderboard excerpt** (Ch14) — band-colored, top/bottom slices only, labeled.

**Precision flags — do NOT over-encode:**
- Never plot a trend line / sparkline of composite history in the prospectus: the public scores are young and the pipeline applies changes only at delta ≥5. A trajectory line would imply longitudinal precision we don't have. State movement in words instead.
- Floor scores (Israel 0.0, Sudan 0.0, UHG 10.2) are **floor designations / near-floor**, not fine-grained measurements — annotate as such; never imply 0.0 vs 0.4 resolution.
- Don't render the integration-premium math as a precise curve; show it as the conceptual "balanced 70/70 out-earns spiky 90/40" callout only.
- Any single entity's 8-dimension **radar** must carry the area-misleads caveat and be used as a recognizable *shape*, not a measurement (Ch9 before/after). Prefer the dimension-profile bar where possible.

Recommended chart style: honest, restrained, own-data, zero-baseline, band-colored with label+position redundancy, tabular numerals, no chartjunk, no 3D, no pie except the single revenue-mix donut. Every chart gets a plain-language takeaway title (Burn-Murdoch rule) and an `aria`/alt-equivalent caption carrying the numbers for the accessible PDF.

---

## 4. Graphic-to-Chapter Map + Pull-Quote / Sidebar Guidance

| Graphic | Primary chapter(s) | Part |
|---|---|---|
| Cover arc + band hairline | Front 1 | — |
| At-a-glance infographic (1,256 · 8 · 40 · 5 tiers · ask) | Front 5 (Exec Summary) | — |
| H1 "We measure everything except this" | Part I Ch3; reused Ch4 | I |
| Existing-frameworks comparison table | Ch4 | I |
| recognize→respond→reduce loop | Ch5 | II |
| Eight-dimension wheel + icon system | Ch6; Appendix A | II |
| H2 evidence pyramid | Ch7; Appendix B | II |
| Anchored 0–5 scale + composite callout | Ch8 | II |
| Dimension profile bar (before/after) | Ch9 | II |
| Behavioral-evidence ladder | Ch10–11 | III |
| Pressure-test / cost-test gate | Ch13 | III |
| AI/robotics + Universities + F500 + Country data-viz | Ch14–17 | IV |
| Band distribution (1,256) | Ch3, Ch18, Front 5 | I/IV |
| H3 theory of change | Ch22; funder-summary | V |
| H7 impact / KPI dashboard | Ch23 | V |
| H4 pipeline workflow | Ch25; Appendix C | VI |
| Two-plane independence diagram | Ch26; Appendix D | VI |
| H5 roadmap timeline | Ch27 | VI |
| Revenue-mix donut + cost bar | Ch28 | VI |
| H6 funding-package cards | Ch29; Appendix E | VI |
| Closing dimension-ring spread | Ch30 | VI |

**Pull-quote treatment per Part** (one on each divider, set large, left-aligned, attributed to methodology not a person): I — *"Mission statements are not evidence."* II — *"At institutional scale, compassion is not a feeling. It is a pattern of decisions."* III — *"High performance when it is easy is not evidence of institutional character."* IV — *"The question is whether care survives process, pressure, scale, incentives, and time."* V — *"A score only matters if it becomes a shared language."* VI — *"Independence locked, not promised."*

**Sidebar treatment per Part** (clarify, not decorate; marked with the relevant dimension icon): I — definitions (what "suffering-treatment" means). II — methodology notes (anchors, pressure-test cap). III — cautionary limitations (attribution rule; floor vs near-floor). IV — short worked examples (UHG, Universities). V — funder implications. VI — governance notes + how a reader uses the benchmark.

---

## 5. PDF Production Pipeline

**Recommendation: two-track.** Use the proven Markdown → styled HTML (marked) → headless Edge print-to-PDF pipeline as the **continuous-proof / internal-review track** — it lets the manuscript stay layout-ready Markdown, regenerate on every edit, and validates word count, hierarchy, and inline SVG. It can produce a *credible, clean* funder PDF now (good enough for early grant attachments and the 3–5pp `funder-summary.md`).

For the **flagship 60–70pp final**, hand to a designer in **Affinity Publisher or InDesign** (not Canva — Canva can't hold the typographic discipline or vector SVG fidelity this needs). Reasons: full-bleed dividers, true two-column flow with baseline grid, kerned DM Sans display, and press-quality control are beyond the print-to-PDF path.

**What the MD→PDF pipeline can own now:** all front/back-matter, the funder-summary, every data table, and **all SVG graphics rendered to final vector** (the heroes and data-viz are hand-rolled inline SVG — reuse the site's chart philosophy: server-rendered SVG strings, no chart libs). Export each graphic as a standalone `.svg` so the designer places vectors, not screenshots.

**What to hand the designer:** (1) clean final Markdown manuscript; (2) a graphics folder of named, final-vector `.svg` files (one per H1–H7 + each data-viz), each with its takeaway title baked in; (3) `layout-notes.md` (page rhythm, type scale, callout/pull-quote/table specs); (4) the brand tokens (light-surface band ramp for print, DM Sans, navy + off-white surfaces); (5) the eight-dimension icon set as a single SVG sprite.

**Constraints to respect:** static-export SVG philosophy (no rasterized charts — vectors stay crisp at A4/Letter and print); bleed/safe-margins for full-page dividers; CMYK-safe check on the band ramp before any physical print run (the light ramp is chosen partly for this); embed/outline fonts; keep file under email-attachable size (compress photos — but we have none, which helps); accessible tagged PDF (alt text from each graphic's caption, reading order, real text not outlines in the body). Keep bracketed layout notes out of the manuscript — they live in `layout-notes.md`.

---

### Summary

- **Cover:** the brand's Calibrated Arc mark on a dark navy field with the 5-band red→cyan scale stated once as a thin hairline — measurement + the single human (pivot dot), no photography, fully on-brand "forensic gravity."
- **Eight-dimension icons:** one simple 2px line mark per dimension in its `dimensions.ts` color (signal arcs = Awareness, overlapping profiles = Empathy, plumb-line-under-load = Integrity, root tree = Systemic, balanced beam = Equity, etc.), built once and reused ~30× across dividers, the wheel, and sidebars.
- **Two most important heroes:** (1) **"We measure everything except this"** — the matrix of finance/safety/cyber/environment standards vs. the missing compassion standard; the most persuasive single page for a funder. (2) **The evidence-hierarchy pyramid** — proves the scores aren't PR ("mission statements are not evidence"), the credibility anchor the whole prospectus leans on.
