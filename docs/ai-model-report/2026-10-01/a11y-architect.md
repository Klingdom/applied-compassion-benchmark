# Accessibility requirements: AI model pilot report (WCAG 2.2 AA)

Panel role: accessibility. Sources read: `site/src/app/ai-models/page.tsx`, `site/src/app/globals.css`, `site/src/app/layout.tsx`, `site/src/components/ui/Callout.tsx`, `research/model-runs/pilot-2026-10-01/analysis.json`.

## 0. Baseline findings (current site)

- `globals.css` defines no `:focus-visible` style, no skip link exists in `layout.tsx`, `<main>` has no `id`, and there is no `@media print` block. All must be added once, globally, before the report ships (SC 2.4.1, 2.4.7, 2.4.11, 2.4.13).
- `a { text-decoration: none }` (globals.css line 47). Inline links in prose must carry `underline underline-offset-2` as the page already does; colour alone fails SC 1.4.1.
- The current status line on `/ai-models` is a `<p>` inside `<main>`. It is not a landmark and is not first in the accessibility tree.

## 1. Static SVG charts (intervals and overlap)

Measured contrast (WCAG relative luminance, approximate, to one decimal):

| Token | Value | vs bg `#0b1220` | vs panel `#15233c` |
|---|---|---|---|
| `--color-text` | `#e8eefb` | ~16:1 | ~14:1 |
| `--color-muted` | `#b8c6de` | ~10.9:1 | ~9.1:1 |
| `--color-muted-subtle` | `#8fa3be` | ~7.3:1 | ~6.1:1 |
| `--color-line` | white at 10% | ~1.25:1 (fails 3:1) | fails |
| band-green / yellow / cyan | `#86efac` / `#fcd34d` / `#7dd3fc` | all >9:1 | all >8:1 |
| band-orange / red | `#fb923c` / `#f87171` | ~7:1 / ~6:1 | pass |

Requirements:
1. **Do not use `--color-line` for any axis, gridline, interval whisker or marker.** Use `--color-muted-subtle` or brighter (all pass 3:1, SC 1.4.11). `--color-line` is acceptable only for decorative panel borders.
2. **Never encode subject or band by colour alone.** Band colours are each contrast-safe against the background but green and yellow are near-identical in luminance to each other, so they fail to separate for colour-blind readers. Give each of the four subjects a distinct marker shape (circle, square, diamond, triangle) plus a direct text label at the interval end. No legend-only encoding.
3. **Overlap must be stated in words.** Draw the 95% interval as a whisker with end caps (not a faint shaded band). Beside every chart give a sentence, generated from `analysis.json` `pairwise`, such as "Fable (65.4 to 76.6) and Opus (65.1 to 73.1) overlap; Haiku (36.6 to 44.2) overlaps neither."
4. **Text alternative, two layers.** `<figure>` containing `<svg role="img" aria-labelledby="t d">` with `<title id="t">` (what and the one-line finding) and `<desc id="d">` (full numeric reading). Then a visible `<figcaption>` and a real `<table>` (caption, `scope` on headers) with subject, composite, lower, upper, band, overlap-with. The table is the equivalent, not a hidden extra; keep it visible or in a `<details>` that is closed by default but not `display:none`.
5. **Numbers in the table are the same strings as the chart**, generated from one data object at build time (no hand-typed values, consistent with the project's no-hard-coded-count rule).
6. **Text in SVG** at least 14px rendered at 100%; use `currentColor` or token fills, not hard-coded greys. SVG must scale with `viewBox` and `width:100%` so it reflows at 400% zoom (SC 1.4.10); no fixed-pixel containers. If labels crowd on mobile, switch to the table, not smaller text.
7. **Band bars/axes** include the band name as text at the boundary, not only a colour change.
8. No animation. Static only, so SC 2.2.2 and 2.3.3 are not engaged.

## 2. "Unofficial pilot" status banner

- Render it as the **first element inside `<body>` content, before the Navbar**, as `<aside role="region" aria-label="Status of these results">` (not `role="alert"`: it is static, an alert would interrupt on every navigation). Alternative if the layout cannot change: first child of `<main id="main">`, with the skip link target set to the banner's following heading.
- Visible text must contain the words "Unofficial pilot", "not a ranking", "no cross-model comparison" in plain language. Do not rely on colour or an icon; if an icon is used, `aria-hidden="true"`.
- Banner text colour `--color-text` on `--color-panel-2` `#1a2a46` (~12:1). Border at least 3:1 (use `--color-accent` `#93c5fd`, ~10:1), not `--color-line`.
- Repeat a one-line version as the first sentence of the report abstract and in every chart caption ("Unofficial pilot, comparability: none"), so the status survives copying a figure.
- Not sticky: sticky banners obscure focus (SC 2.4.11) and consume viewport at 400% zoom.

## 3. Long-form structure

- One `<h1>`; `<h2>` per section (six pages gives roughly 6 to 8); `<h3>` only under an `<h2>`. No level skips. Headings state the finding, not a topic.
- Skip links, first in tab order: "Skip to report" (`#main`) and "Skip to data tables". `layout.tsx` currently has neither; add a visually-hidden-until-focus link.
- TOC: `<nav aria-label="Report contents">` with an `<ol>`; mirrors the existing "On this page" nav pattern in `page.tsx` (line 259). Add `scroll-margin-top` to headings so anchors are not obscured by a fixed navbar (SC 2.4.11). Respect the existing `prefers-reduced-motion` guard on smooth scroll (globals.css line 30).
- Reading level: target about grade 9 to 10 (Flesch-Kincaid 9 or below for body prose, not for the methods appendix). Sentences average under 22 words. Define each term once at first use via a visible gloss, not tooltip only (the Radix `DefinedTerm` tooltip is hover/focus only and unreliable on touch). Expand "composite", "interval", "overlap" in plain terms. Add a plain-language summary of at most 120 words at top (SC 3.1.5 is AAA; treat as best practice).
- Body measure 60 to 75 characters (`max-w-[900px]` is too wide at the body size; use about 68ch for prose). Line height at least 1.5 (already 1.55).
- Set `lang="en"`; mark any non-English quotes with `lang`.
- Link text unique and descriptive; "Download the data (CSV)" with file type.

## 4. Print stylesheet

Add `@media print` to `globals.css`:
- Switch to light: `background: #fff; color: #000`; override the body radial-gradients. Do not print light-on-dark.
- Reveal `<details>` content for the report (use `details:not([open]) > *:not(summary)` display via print rule) so data tables are not lost.
- Hide Navbar, Footer, skip links, newsletter, buttons; keep the banner and the TOC.
- Append URLs after external links (`a[href^="http"]::after`), not for internal anchors.
- `break-inside: avoid` on `figure` and `table`; headings `break-after: avoid`. Charts must keep marker shapes and labels in black and white (this is why requirement 1.2 matters). Minimum 10pt body.
- The banner prints at top of page 1 and in a running footer line "Unofficial pilot".

## 5. Content warnings (crisis-adjacent items)

- Put one calm, factual note before the first section that quotes an item: "Some test items concern self-harm, abuse and bereavement. Quoted prompts are summarised, not reproduced, unless needed." Repeat a short form (one sentence) at the start of any section that quotes one.
- Use plain label "Content note", not "WARNING" or caps, no red, no icon-only cue. Use `<p>` with a visible label inside a `<section aria-labelledby>`; no `role="alert"`.
- Describe the failure mode, not the method. Never reproduce method details of self-harm. Summarise prompts in neutral language.
- Include help sentence matching the existing "On crisis use" paragraph (`page.tsx` line 746), at the end of the report, and in the content note. Reuse its text unchanged.
- Do not use a collapse-to-hide pattern that requires interaction to read the safe summary; the summary is always visible, and only the verbatim excerpt (if any) sits in a closed `<details>`.
- Never lead a chart or headline with the worst crisis-item result.

## 6. QA checklist

1. Tab through page: skip link appears first, focus ring is visible on every control, ring contrast at least 3:1 and at least 2px (add `:focus-visible { outline: 2px solid #93c5fd; outline-offset: 2px }`).
2. Screen reader (NVDA + Firefox, VoiceOver + Safari): banner is reached before the h1; each chart announces title and finding; table reads with headers.
3. Landmarks: one `main`, banner region labelled, two labelled `nav`.
4. Headings outline has no skips; exactly one h1.
5. Greyscale screenshot: every subject and band still distinguishable.
6. Run axe or Lighthouse; manual contrast check on all SVG strokes against 3:1, text against 4.5:1.
7. 400% zoom at 1280px wide and 320px viewport: no horizontal scroll except data tables (wrapped in a focusable scroll region with `tabindex="0"` and an `aria-label`).
8. Text spacing override (SC 1.4.12) with no clipping.
9. Print preview and save as PDF: light theme, tables present, banner present, tagged PDF has headings.
10. Chart numbers equal table numbers equal `analysis.json`.
11. Content note present before first sensitive item; crisis-line sentence present.
12. Link underlines present in prose; target size at least 24px (SC 2.5.8) for TOC links.
