# Appendix F: Suggested Graphics and Layout System

This appendix is the reference for how the prospectus looks and how its graphics are built. The design north star is forensic gravity: a precise instrument applied to a human subject. Serious, calm, credible, human. Not charity, not ESG software, not an academic wall of text. One rule governs every visual. Every graphic must be reproducible from Compassion Benchmark's own scored data, and nothing is decorative. A chart that cannot be rebuilt from the index data or the methodology does not belong in the document.

---

## 1. The visual system

**Cover.** The brand's calibrated measurement arc with its center pivot dot sits as a quiet hero over a dark navy field. The five-band sequence appears once as a thin graduated hairline, stating the whole 0 to 100 scale before a word is read. The single human at the heart of measurement is carried by the pivot dot and the subtitle line, not by a photograph. The brand's imagery stance is data diagrams only: no stock photography, no glowing networks, no AI purple. This keeps the cover copyright-clean and on-brand.

**Section dividers.** One per Part, six in total, on a consistent template: a full-bleed dark page, the Part number set large, the Part title, one dimension-colored motif rotating across the six Parts, and one sharp pull-quote attributed to the methodology rather than a person. The repetition builds rhythm; the rotating color signals a new movement.

**The eight-dimension icon set.** One simple line icon per dimension, each in its `dimensions.ts` color, drawn on a shared 24-by-24 grid with a consistent 2px stroke. Signal arcs for Awareness, overlapping profiles for Empathy, a forward chevron resolving into an open hand for Action, a balanced beam for Equity, a bracket with a gap for Boundaries, a circular return-arrow for Accountability, a root tree for Systemic Thinking, a plumb-line holding straight under load for Integrity. Built once, reused roughly thirty times as section bullets, the wheel spokes, and sidebar markers.

**Color.** The brand, link, and accent color is blue `#3b82f6`, with tint `#93c5fd`. This is mandatory in print as well as on screen. Cyan `#7dd3fc` means Exemplary and nothing else; it is never used as a general accent, because that would imply top-band status. The band sequence runs warm to cool, red as harm: Critical `#f87171`, Developing `#fb923c`, Functional `#fcd34d`, Established `#86efac`, Exemplary `#7dd3fc`. For print, use the light-surface band ramp (Critical `#dc2626` through Exemplary `#0284c7`) on warm off-white pages so the bands survive on paper, and reserve the dark navy field for the cover, dividers, and full-page hero graphics. Colorblind redundancy is non-negotiable: every band carries its label and its left-to-right position, monotonic luminance, and a hatch pattern on Critical in dense charts.

**Type and rhythm.** DM Sans 700 for headings; a humanist body face with generous leading; strong hierarchy; tabular numerals in every table and chart. A 4px spacing base. Page rhythm varies deliberately: full-page opener, two-column narrative, a full-page hero roughly every six to eight pages, a callout page, a dense table page, then back to air. Never two dense pages adjacent.

---

## 2. The hero graphics

Seven signature graphics carry the argument. Each has a single reader question and a plain-language takeaway title.

| # | Graphic | Reader question | Source |
|---|---|---|---|
| H1 | "We measure everything except this" matrix | Why is there a standard for finance, safety, cyber, and environment but not suffering? | §1 problem; §9 comparables |
| H2 | Evidence-hierarchy pyramid | How do you know a score is not PR? | §3 five tiers |
| H3 | Theory-of-change logic model | What does funding actually cause? | §9 causal pathway and assumptions |
| H4 | Nightly-pipeline workflow swimlane | Is this real and durable? | §5 pipeline; §4 lifecycle |
| H5 | Roadmap timeline | When does what happen, and when is independence locked? | §9 formation; §10 phases |
| H6 | Funding-package cards | What exactly am I funding? | §10 ask sizes and KPIs; Appendix E |
| H7 | Impact and KPI dashboard | How will we know it worked? | §10 KPIs; impact forward-looking |

H1 and H2 carry the most weight. The matrix is the single most persuasive page for a funder: it shows the accountability vacuum as structural and obvious, then fills the missing row with the benchmark's own mark. The pyramid proves the scores are not public relations, the credibility claim the whole document leans on. Supporting heroes build cleanly from the chapter set: the eight-dimension wheel, the two-plane independence diagram, the recognize-respond-reduce loop, and the revenue-mix donut beside the cost-base bar.

---

## 3. Chart principles

Charts are honest, restrained, and built from Compassion Benchmark's own data: zero-baseline, band-colored with label-and-position redundancy, tabular numerals, no chartjunk, no 3D, and no pie chart except the single revenue-mix donut. Every chart gets a plain-language takeaway title and an alt-text caption that carries the numbers for the accessible PDF. Buildable now from the index JSONs: the band distribution across the 1,256 entities, a sector comparison strip on one 0 to 100 axis, the universities worked example (mean 46.2, zero Exemplary, USC 36.7 to Harvard 52.3), the Fortune 500 composite histogram, and country and AI-and-robotics leaderboard excerpts.

What not to encode matters as much. Never plot a trend line of composite history: the public scores are young and the pipeline applies changes only at a delta of 5 or more, so a trajectory would imply longitudinal precision the data does not have. State movement in words instead. Floor scores (Israel 0.0, Sudan 0.0, UnitedHealth Group 10.2) are floor or near-floor designations, not fine-grained measurements; annotate them as such and never imply 0.0 against 0.4 resolution. Do not render the integration-premium math as a precise curve; show it as the conceptual callout that a balanced 70/70 profile out-earns a spiky 90/40 profile. Any single entity's eight-dimension radar must carry the area-misleads caveat and be read as a shape, not a measurement; prefer the dimension-profile bar where possible.

---

## 4. PDF production path

Two tracks. The continuous-proof track is the Markdown to styled HTML to headless Edge print-to-PDF pipeline. It keeps the manuscript as layout-ready Markdown, regenerates on every edit, validates word count and hierarchy and inline SVG, and produces a clean, credible funder PDF now, good enough for early grant attachments and the short funder summary.

For the flagship 60-to-70-page final, hand the work to a designer in Affinity Publisher or InDesign, not Canva, which cannot hold the typographic discipline or vector fidelity this needs. The handoff is five items: the clean final Markdown manuscript; a graphics folder of named, final-vector `.svg` files, one per hero graphic and each data-viz, each with its takeaway title baked in; the layout notes covering page rhythm, type scale, and callout and table specs; the brand tokens, with the light-surface band ramp for print; and the eight-dimension icon set as a single SVG sprite.

Constraints to respect: hand-rolled, static-export-safe inline SVG with no chart libraries, so vectors stay crisp at A4 and Letter; bleed and safe margins for full-page dividers; a CMYK-safe check on the band ramp before any physical print run; embedded or outlined fonts; an email-attachable file size; and an accessible tagged PDF with alt text from each graphic's caption, a correct reading order, and real text in the body rather than outlines.

---

## Flagged for verification

- **Brand tokens.** The palette, the blue-accent-with-cyan-reserved rule, and the dimension colors trace to `docs/BRAND_VISUAL_IDENTITY.md` and `dimensions.ts`. Confirm the final blue-and-cyan decision with the founder before the designer builds the final SVGs, since it governs roughly thirty placements.
- **Light-surface print ramp.** The print band ramp (Critical `#dc2626` through Exemplary `#0284c7`) is a print-survivability and CMYK-safety choice; confirm it against the brand identity document before a physical print run.

Source of truth: `plan/04-graphics-layout-plan.md` (full visual system, hero briefs, data-viz candidates, production pipeline); `docs/BRAND_VISUAL_IDENTITY.md` (palette and type); `site/src/data/dimensions.ts` (dimension colors and bands). Section references above are to `source_notes.md`.
