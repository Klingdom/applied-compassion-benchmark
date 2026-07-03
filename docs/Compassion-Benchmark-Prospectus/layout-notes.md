# Layout Notes: Compassion Benchmark Funder Prospectus

**Owner:** Data-Visualization / Layout Architect.
**Companion to:** `graphics-plan.md` (the visuals), `chapters/appendix-F-graphics-and-layout-system.md` (the in-manuscript reference), `docs/BRAND_VISUAL_IDENTITY.md` (palette and type).
**Scope:** how the 60 to 70 page prospectus reads on the page. These are layout instructions for the designer; they live here and never in the final manuscript.

**Design goal:** serious, calm, credible, human. A flagship public-interest publication that could sit beside a Gates Foundation annual letter, a Stanford HAI report, or an Our World in Data brief. Not a startup deck, not corporate ESG, not an academic wall of text, not a glossy philanthropy brochure. Design strengthens credibility; it never compensates for weak writing.

---

## 1. Page rhythm guidance

Vary the page deliberately. A strong 60 to 70 page document breathes by alternating density. Never place two dense pages adjacent.

The intended cadence:

- **Full-page chapter opener** to start each chapter (see §3).
- **Two-column narrative spreads** for running argument.
- **A full-page hero graphic** roughly every six to eight pages (H1 to H7 and the supporting heroes).
- **A callout or reflection page** to let a key claim land with air around it.
- **A short worked example or case page** (UnitedHealth Group, Universities, country floor cases).
- **An occasional dense methodology or table page** (the eight-dimension wheel, the 8-by-5 reference grid, the safeguard checklist), always followed by a return to air.

One idea per spread in the narrative Parts. The six Part dividers are the structural metronome: each is a full-bleed dark page that resets the eye and signals a new movement (see `graphics-plan.md` §3). The cover and the closing dimension-ring spread bookend the document on the same dark field, so the reader ends where they began.

Sequence check for the proof: walk the assembled PDF and confirm no two consecutive pages are both dense (table, dense methodology, or full leaderboard). If two collide, move a callout, pull quote, or worked example between them.

---

## 2. Typography recommendations

- **Headings and display:** DM Sans 700 (OFL-licensed). Confident, grotesque, institutional. The wordmark and all chapter titles. Tracking about 0.3px on the wordmark.
- **Body:** a humanist body face with generous leading. A transitional serif (for editorial gravity) or a humanist sans both work; choose one and hold it. Generous line spacing, comfortable measure (roughly 60 to 72 characters per line in the two-column grid).
- **Numerals:** tabular figures in every table, chart, KPI block, and price. Non-negotiable, because the document is a measurement instrument and misaligned digits read as imprecision.
- **Hierarchy:** strong and few-leveled. Display (chapter title), headline (section), title (subsection), body, label (chart and table headers), micro (captions, credits, footnotes). Define each as a token with `clamp()` for the screen-PDF proof.
- **Restraint:** no decorative fonts, no futuristic or AI-style display faces, no all-caps running text. Color is reserved for encoding meaning (band scale and dimension palette), never for headings, body, or buttons.
- **Wordmark hierarchy:** "Compassion" in the text color, "Benchmark" in the muted color, a single one-point hierarchy. The name set legibly is the primary authority signal; it must read at footnote scale (10pt citations, chart credits, badges).

---

## 3. Chapter opening treatment

Each chapter opens on its own page with a consistent template so the reader always knows where they are:

- The chapter number and title in DM Sans 700, set large, high on the page.
- A one-line chapter takeaway (the core reader takeaway from `chapter-index.md`) set in the muted color beneath the title, as a deck.
- Generous white space above and below. The opener is a breathing page, not a dense one.
- A small dimension-icon marker keyed to the chapter's host Part, echoing the divider motif, as a quiet wayfinding cue.
- The body begins lower on the opener page or on the following spread, flowing into the two-column grid.

Part dividers (full-bleed dark) precede the first chapter of each Part and carry the Part number, title, motif, and pull-quote (see `graphics-plan.md` §3). A chapter opener is light-surface; a Part divider is dark. The contrast between them marks the two levels of structure.

---

## 4. Callout styles

Callouts pull a single idea out of the flow for emphasis. Keep them few and purposeful.

- **Key-claim callout:** a short, bordered block in the off-white surface, the claim set one step larger than body, with a thin blue (`#3b82f6`) left rule. Used for the load-bearing sentences a funder must not miss (for example, the nightly-cost leverage line, the independence-rule statement).
- **Definition callout:** a quieter boxed block marked with the relevant dimension icon, for first-use definitions (Part I register).
- **Caution / limitation callout:** a block marked with a small caution cue and the muted color, for honest hedges (floor versus near-floor, "human-gated, not hand-assessed," "all figures projected, not booked"). The honesty callouts are a credibility asset; give them real estate, do not bury them.
- **Stat callout:** a single large tabular number with a short label, for figures like 1,256 entities or the $27.50 to $62.50 nightly cost. Number in DM Sans 700; never band-colored unless the number is itself a band score.

No callout uses band colors as decoration. Blue is the only accent rule in callout chrome.

---

## 5. Pull-quote treatment

- Set large, left-aligned, in DM Sans, one step or two below the chapter-title size.
- Attributed to the methodology or to the document, never to a person (these are claims the institution stands behind, not testimonials).
- Marked with the small dimension icon of the host Part.
- Used sparingly: the six primary pull quotes live on the Part dividers (one each); reserve quotes appear only on dedicated reflection or callout pages, at most one per spread.
- Never set a pull quote in a band color. Never let a pull quote repeat a sentence verbatim from the adjacent body on the same spread; pull it from elsewhere in the chapter so it adds, rather than echoes.
- The full quote list and source lines are in `graphics-plan.md` §14.

---

## 6. Tables and charts treatment

Tables and charts are first-class design objects, not afterthoughts. They carry the argument as much as the prose.

**Tables:**
- Use tables to compare existing frameworks, evidence tiers, funding packages, output-versus-outcome-versus-impact, governance safeguards, and the chapter roadmap.
- Readable, not spreadsheet-dense. Generous row height, tabular numerals, a single hairline rule system, no heavy gridlines, no zebra striping unless a table runs long.
- Column headers in the label style; left-align text columns, right-align or decimal-align number columns.
- Band scores inside tables carry the band color plus the band label, never color alone.

**Charts (full conventions in `graphics-plan.md` §13):**
- Hand-rolled inline SVG, no chart libraries, static-export-safe, exported as standalone vectors so they stay crisp at A4 and Letter.
- Zero baselines on magnitude bars; truthful axes; no chartjunk, no 3D; no pie except the single revenue-mix donut.
- Every chart carries a plain-language takeaway title (the title states the point), band label-and-position redundancy, a Critical-band hatch in dense charts, and an alt-text caption that carries the numbers for the tagged PDF.
- Use the **light-surface band ramp** on off-white body pages so bands survive on paper; reserve the dark band ramp for the cover, dividers, and full-page heroes on the navy field.
- Honor the precision flags: no composite trend lines, floor scores annotated as floor or near-floor, integration premium shown as a concept not a curve, single-entity radars replaced by dimension-profile bars wherever possible.

---

## 7. Image use principles

- **Imagery stance: none. Data diagrams only.** Every visual is reproducible from Compassion Benchmark's own scored data or its published methodology. This is a positioning strength, the Our World in Data and V-Dem model, not a limitation.
- **No stock photography**, no waiting-room or clinician photos, no glowing networks, no AI purple, no generic business hands, no abstract data swarms. The human subject is carried by the cover pivot dot, the verbatim language in callouts, and the worked examples, not by a photograph.
- **No third-party images of any kind** (photos, satellite, wire, AI-generated). Any reference to outside material is link-only with an archive snapshot, never an embedded image.
- Any inline raster would require an explicit license field; the document is built to need none, which keeps it copyright-clean and email-attachable.
- Respect dignity: no poverty imagery, no staged collaboration imagery. The argument is made with evidence and structure, not with affect.

---

## 8. White-space guidance

- 4px spacing base; build the vertical rhythm on it.
- Generous outer margins; a true two-column grid on a baseline grid for narrative spreads.
- Chapter openers, Part dividers, callout pages, and the closing spread are deliberately spacious. Let the most important single claims sit alone.
- Dense pages (the eight-dimension wheel, the 8-by-5 reference grid, the safeguard checklist, full leaderboards) are permitted but always bracketed by air; never two dense pages in a row (see §1).
- Around every full-page hero graphic, give a clear margin so the graphic reads as a designed object, not a screenshot dropped into text.
- White space is the calm in "serious, calm, credible." Crowding reads as anxiety, which undercuts the instrument's authority.

---

## 9. PDF production notes (two-track)

**Track A, continuous proof: Markdown to styled HTML to headless Edge print-to-PDF.** This is the internal-review and early-attachment track. It keeps the manuscript as layout-ready Markdown, regenerates on every edit, and validates word count, heading hierarchy, and inline SVG. It produces a clean, credible funder PDF now, good enough for early grant attachments and the 3 to 5 page `funder-summary.md`. Use marked (or equivalent) for the Markdown-to-HTML step and a headless Edge print-to-PDF for output. This track owns all front and back matter, the funder summary, every data table, and all SVG graphics rendered to final vector.

**Track B, flagship final: Affinity Publisher or InDesign.** The 60 to 70 page flagship goes to a designer in a professional layout tool, not Canva, which cannot hold the typographic discipline or vector fidelity this needs. Track B owns full-bleed dividers, true two-column flow on a baseline grid, kerned DM Sans display, and press-quality control.

**Handoff package to the designer (five items):**
1. The clean final Markdown manuscript (no bracketed layout notes inside it; those live here).
2. A graphics folder of named, final-vector `.svg` files, one per hero graphic (H1 to H7) and each data-viz, each with its takeaway title baked in.
3. This `layout-notes.md` (page rhythm, type scale, callout, pull-quote, and table specs) plus `graphics-plan.md`.
4. The brand tokens, with the light-surface band ramp for print, DM Sans, and the navy plus off-white surfaces.
5. The eight-dimension icon set as a single SVG sprite.

**Constraints to respect:**
- Hand-rolled, static-export-safe inline SVG only; no chart libraries; no rasterized charts (vectors stay crisp at A4 and Letter).
- Bleed and safe margins on every full-page divider and the cover.
- A CMYK-safe check on the light-surface band ramp before any physical print run (the light ramp is chosen partly for this).
- Embed or outline fonts; keep the file under an email-attachable size (no photos to compress, which helps).
- Produce an accessible tagged PDF: alt text from each graphic's caption, a correct reading order, and real text in the body rather than outlines.
- Confirm the two flagged brand decisions before final SVG build: the blue-accent-with-cyan-reserved rule, and the light-surface print ramp. Both govern roughly thirty placements; changing them after build is expensive.

---

## 10. Quick reference: surfaces

| Element | Surface | Band ramp |
|---|---|---|
| Cover, Part dividers, full-page heroes, closing spread | Dark navy (`#0b1220` to `#1a2a46`) | Dark (Critical `#f87171` to Exemplary `#7dd3fc`) |
| Chapter openers, body spreads, tables, callouts, in-body charts | Warm off-white | Light (Critical `#dc2626` to Exemplary `#0284c7`) |
| Accent (links, rules, callout chrome, primary marks) | both | Blue `#3b82f6` only; cyan never used as accent |
