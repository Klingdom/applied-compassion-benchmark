# Brief 05: Accessibility and cognitive accessibility (Learn)

Lens: WCAG 2.2 AA plus cognitive accessibility for children and students. Date: 2026-10-14. Prefix: A11Y-R.

## What the repo gives us (and where it falls short)
- Palette in `site/src/app/globals.css:3-28`. Body text `#e8eefb` and muted `#b8c6de` on `#0b1220` are far above 4.5:1. `--color-muted-subtle` `#8fa3be` is about 6:1 on `--color-bg`, but nearer 5:1 on `--color-panel-2`. That is the lowest text tier and must be checked, not assumed.
- Baseline: `:focus-visible` 2px `#93c5fd` ring, skip link, smooth scroll gated on `prefers-reduced-motion: no-preference` (`globals.css:30-86`). `<html lang="en">` is set (`site/src/app/layout.tsx:114`).
- Gaps:
  - There is no `prefers-reduced-motion: reduce` rule for the `defined-term-fade-in` animation (`globals.css:56-63`).
  - Type is the system stack only (`globals.css:38`); there are no user type controls.
  - `DefinedTerm.tsx` puts `role="button"` on a `span` that does nothing when activated. It relies on a hover/focus Radix tooltip whose methodology link sits in a tooltip a keyboard user cannot reach, and tooltips are a poor touch pattern (WCAG 1.4.13, 4.1.2). Do not reuse it in Learn as is.
  - `Button.tsx` has a 48px minimum height (good). The bare `<button>` branch has no `type` and no handler.
  - `Band.tsx` pairs colour with a text label (good; keep it). Its text is 0.78rem, too small for children.
- Existing a11y tests: none found (no `*a11y*`, `*contrast*` or `*reading*` files). Tests are Node scripts wired in `site/package.json`; new ones follow that pattern (`node scripts/test-*.mjs`, no new heavy dependencies).

## Age bands: I accept them, with one change
Keep the four bands plus Educators. Treat "Explorers (8-11)" as a **supported-reading** band: every page must work read aloud by an adult, and no activity may require reading alone. Add a printable/offline variant for each experiment (Chromebook and shared-device reality).

## Recommendations (each with its enforcing test)

### Contrast and colour
**A11Y-R1. Contrast gate from tokens.** Every foreground/background pair used under `/learn` is declared in one `learnTokens` file. A Node test computes WCAG luminance ratios: text at least 4.5:1, large text and UI borders/focus/slider thumbs at least 3:1. Forbid `muted-subtle` for body text in Learn (use `muted` or brighter). *Test:* `test:learn-contrast` fails on any pair below threshold or any CSS colour literal in `/learn` not in the token file.

**A11Y-R2. No colour-only meaning.** Bands (green/yellow/orange/red/cyan) always carry a text label plus a shape or icon. Charts use pattern and direct labels, as the pilot figures do (`globals.css:88-92`). *Test:* a render check that every band swatch is inside an element with text content, plus a CVD simulation script (protan/deutan/tritan matrices) that requires adjacent band fills to differ in luminance by at least 1.3:1 or carry a pattern.

**A11Y-R3. Light learning surface is optional, not default.** Provide a "Light" and a "High contrast" theme via `data-theme` on `html`, from a `prefers-color-scheme`/`prefers-contrast` default, user-overridable, stored only in `localStorage` (no cookies, nothing sent). Projectors wash out dark themes, so ship a **Projector mode** (light, 20px+ base, thick strokes) reachable by one keyboard-operable control. The focus ring flips to `#0b1220` on light surfaces (the current `#93c5fd` fails 3:1 on white). *Test:* R1 runs once per theme; a focus-ring check asserts 3:1 against each theme's surface.

### Typography and layout
**A11Y-R4. Type per band.** Body size, line height and measure:

| Band | Body | Line height | Max line | Notes |
|---|---|---|---|---|
| Explorers | 20px (1.25rem) | 1.7 | 50ch | short paragraphs of 3 sentences or fewer |
| Investigators | 18px | 1.65 | 60ch | |
| Analysts | 17px | 1.6 | 68ch | matches `.pilot-prose` 68ch |
| Researchers | 16px | 1.55 | 72ch | |

Left-aligned, never justified. Paragraph spacing at least 1.5 times the line height (SC 1.4.12). Nothing may break at 400% zoom or 320 CSS px wide (SC 1.4.10). *Test:* `test:learn-type` checks the CSS custom properties per band; a Playwright-free check lints for `text-align: justify` and fixed `px` heights on text containers.

**A11Y-R5. Dyslexia-friendly, evidence-honest.** Default to the clear system sans stack with generous spacing. Do not ship OpenDyslexic as a default (the evidence for it is weak). Offer a "Reading settings" panel: text size (3 steps), spacing (normal/wide, meeting SC 1.4.12 values 0.12em letter, 0.16em word), line focus ruler, and an optional dyslexia-oriented font only if self-hosted and licensed. No italics or ALL CAPS for sentences; bold for key terms. *Test:* a style-override test applies the SC 1.4.12 override block and asserts no clipped or overlapping text in the component fixtures (a headless DOM check, or a CSS lint if no browser is available).

### Reading level (mechanical, CI-runnable)
**A11Y-R6. Flesch-Kincaid grade check in Node.** `site/scripts/test-learn-reading-level.mjs`, about 60 lines, no dependencies: strip markup and code, split sentences on `. ! ?` (respecting abbreviations), count syllables by a vowel-group heuristic with a silent-e rule, compute FK grade = 0.39(words/sentences) + 11.8(syllables/words) - 15.59, and report per page. Strip glossary-defined terms from the syllable count only if listed in `learnGlossary` (they are defined inline, R14). Thresholds, per page prose:

| Band | FK grade max | Words per sentence (mean / max) | Other |
|---|---|---|---|
| Explorers | 4.5 | 10 / 18 | no sentence over 18 words; max 120 words per section |
| Investigators | 7.5 | 14 / 25 | |
| Analysts | 10.5 | 18 / 32 | |
| Researchers | 14 (warn only) | none | |

The heuristic over-counts syllables on names, so a page may carry an `@fk-ignore` list of proper nouns, capped at 5% of words. FK is a floor, not proof: add the human check below. *Test:* `test:learn-reading-level` fails the build on breach; wire it into the `prebuild`/pre-push chain beside `test:no-stale-counts`.

**A11Y-R7. Human reading review, recorded.** Each page carries `reviewedWith: { band, date, readers }` metadata (a teacher or learner read-through). *Test:* the same script fails a page with no review record for its band, so the number cannot be the only gate.

### Experiment controls
**A11Y-R8. Sliders (build-a-score).** Use native `<input type="range">` with a visible `<label>`, `min`, `max`, `step`, and `aria-valuetext` giving words ("3 of 5: Developing") rather than a bare number. Add a paired `<input type="number">` so a switch or voice user can type the value, and +/- buttons of 44x44px or more. Drag is never required (SC 2.5.7). Thumb at least 24px (aim for 44px on touch), 3:1 contrast. Arrow keys step by 1; PageUp/PageDown by 10%. *Test:* a DOM test of the component fixture asserts label, valuetext, number twin and min target size; the CI script fails any `role="slider"` div (native only).

**A11Y-R9. Live results, calm.** One polite `role="status"` region per experiment, announcing the settled result ("Composite 62, Established band. The Accountability weight moved it up 3 points"), debounced to 600ms after the last input so a slider drag does not flood a screen reader. Never `aria-live="assertive"` outside real errors. The same text is visible on screen. The score must come from the shared scoring code, not a re-implementation. *Test:* fixture asserts exactly one live region, `aria-atomic="true"`, and that the announcement string equals the visible string.

**A11Y-R10. Drag-to-sort (band sorting, tier sorting).** Build as a listbox/list with a **keyboard-first** model: each item is a button; Enter or Space picks it up, Up/Down (or Left/Right) moves, Enter drops, Esc cancels and restores. Provide a non-drag alternative for everyone: a "Move to" select per item (or numbered position inputs) and Up/Down buttons. Announce pick-up, moves and drop in the live region ("Library, position 2 of 5, picked up. Moved to position 3 of 5"). Pointer drag is an enhancement only (SC 2.5.7). Target 44px; 8px gap. *Test:* a script drives the component with keyboard events only and asserts the final order; a lint rejects any sortable that has no keyboard handler and no select fallback.

**A11Y-R11. Reduced motion and safe animation.** Wrap every non-essential animation in `@media (prefers-reduced-motion: no-preference)` (invert the current default), add a visible on-page "Reduce motion" toggle that sets `data-motion="reduce"` for devices that cannot set the OS flag (shared Chromebooks), and never flash more than 3 times a second (SC 2.3.1). Dice and bootstrap demonstrations step by a "Roll" button, not autoplay. *Test:* `test:learn-motion` greps Learn CSS/TSX for `animation`, `transition` and `autoplay` outside a reduced-motion guard.

**A11Y-R12. Every graphic has a text twin.** Each SVG figure ships a `<figure>`, caption, and either a data table in `<details>` (the `pf-data` pattern, `globals.css:185-191`) or a prose description of the takeaway. Alt text states the point, not "chart". *Test:* a build check that every `svg` in Learn has `role="img"` plus `aria-labelledby`, or is `aria-hidden` inside a figure with a table.

### Learners and context
**A11Y-R13. Cognitive load, ADHD and autism.**
- One task per screen section; a visible step indicator ("Step 2 of 4") as text; no timers, countdowns, scores that shame, streaks, or auto-advancing content.
- Literal language: no idiom or sarcasm in Explorers and Investigators copy; state what will happen before any control ("This button rolls the dice 10 times").
- Predictable layout: the same control position on every activity; a persistent "Start again" that never loses nothing important.
- Errors never say "wrong"; say "that is not the right band yet; here is why". No penalty states.
- Text, not icons alone, on every control.
*Test:* `test:learn-copy` flags banned words/patterns (idioms list, "hurry", "countdown", "streak", "wrong!") and requires a step indicator component on any multi-step activity.

**A11Y-R14. Plain-language and glossary pattern.** Replace the tooltip with an **inline definition**: the first use on a page is rendered as a `<button aria-expanded aria-controls>` that toggles a visible `<span role="note">` directly after the term (not a hover popup), plus a page-end "Words we used" `<dl>` that is always visible, printable, and reachable by anchor. Keep the glossary single-sourced in `site/src/data/glossary` (already used by `DefinedTerm.tsx:6`) with a new `plain` field per band. Definitions follow R6 thresholds one band below their page. Expand abbreviations on first use. *Test:* every glossary key used on a Learn page must have a definition; terms used but undefined fail; a `<dl>` must exist where any inline term appears.

**A11Y-R15. Screen reader and structure.** One `h1`; strict heading order; landmarks (`main`, `nav` labelled, `search` where present); link text that is meaningful out of context; `lang` on any foreign phrase; "opens in new tab" in the accessible name for external links; table headers with `scope`. After a "Check" action, move focus to the result heading (not the live region) only if the result is long; otherwise announce via the status region. Focus never jumps unexpectedly (SC 3.2.1, 3.2.2). *Test:* axe-core run in CI against built Learn pages (a dev-only dependency; if the founder wants none, the fallback is a custom Node DOM lint for heading order, labelled controls, and unique ids). Zero violations at AA.

**A11Y-R16. Switch, voice and motor access (SC 2.5.8, 2.4.11, 2.4.12, 2.5.3).** Targets at least 44x44px in Learn (above the 24px AA floor), with 8px spacing; focus ring never hidden by sticky headers (`scroll-padding-top`); visible labels equal the accessible name so voice users can say what they see; sequential focus order matches visual order; no single-key shortcuts without a toggle. *Test:* `test:learn-targets` parses component fixtures for min-height/min-width at least 44px on interactive classes; a focus-obscured check scans for `position: sticky|fixed` without `scroll-margin`.

**A11Y-R17. Low vision and classroom devices.** Support 200% text and 400% reflow with no horizontal scroll (except data tables in a scroll wrapper with a keyboard-focusable container, `tabindex="0"` plus a label). Large print stylesheet (the existing print block, `globals.css:194`, is a model): activity sheets print black on white at 14pt+ with no colour dependency. Offline-capable pages (no network calls for experiments). Chromebook: tested with ChromeVox, 1366x768, touch plus trackpad. Shared devices: no persistent personal data; settings in `localStorage` only, with a visible "Reset reading settings" control; no auto-login or names stored. *Test:* `test:learn-offline` asserts no `fetch`/`XMLHttpRequest`/`navigator.sendBeacon` or form `action` within Learn experiment bundles. A manual screen-reader checklist (NVDA+Firefox, VoiceOver iOS, ChromeVox) is signed per release in `docs/learn/A11Y_CHECKLIST.md`.

**A11Y-R18. Analytics on Learn.** Umami loads on every page via `layout.tsx` (about line 149). My position: **disable it on `/learn/explorers` and `/learn/investigators`, and on every activity page**, because no accessibility benefit justifies it, and the learner (and shared-device) context makes consent murky. Keep it on Analysts, Researchers and Educator pages only if cookieless, which the self-hosted instance appears to be. *Test:* a build test asserts the Umami script tag is absent from the built HTML of the restricted routes.

## Top 3
1. **A11Y-R10 + R8:** keyboard- and switch-operable experiment controls with live-region results. This is the usual failure point of educational interactives.
2. **A11Y-R6/R7:** the per-band reading-level gate in CI, plus recorded human review.
3. **A11Y-R1/R3:** the contrast gate plus a Projector/light theme. Classrooms rarely use dark mode on projectors.

## What I would refuse to build
- Drag-only sorting or sliders implemented as custom `div`s without a native or numeric alternative.
- Hover-only or tooltip-only definitions for children.
- Timers, streaks, leaderboards, avatars, "level up" badges or any gamified pressure; they harm ADHD and anxious learners and also hint that learning raises a score (the education firewall).
- An accessibility overlay or widget from a third party (it adds trackers and often breaks assistive tech).
- Colour-coded band charts without labels or patterns.
- Autoplay audio or video, or a text-to-speech service that sends text to a third party.
- An FK score shown to children, or used as the only quality measure.

## Open questions (default in bold)
1. Add `axe-core` as a dev dependency? **Yes, dev-only, never shipped to the browser.**
2. Light and Projector themes: do they conflict with "dark theme only" in `CLAUDE.md`? **Allow them in Learn only, via tokens, and amend the convention for `/learn`.**
3. Dyslexia font? **No default font change; offer spacing and size controls; revisit with educator feedback.**
4. Umami on Learn? **Off for Explorers, Investigators and all activities (R18).**
5. Is the Explorers FK ceiling of 4.5 too strict for terms like "evidence"? **Keep, with a glossary exemption list capped at 5% of words.**
6. Who performs the human reading review and the screen reader sign-off? **The founder recruits two educators and one disabled learner or advocate before launch; deploy stays founder-gated per `AUTONOMY.md`.**
7. Are translations in scope? **Not for v1; keep `lang` handling and FK in English only, and flag that FK does not transfer to other languages.**
