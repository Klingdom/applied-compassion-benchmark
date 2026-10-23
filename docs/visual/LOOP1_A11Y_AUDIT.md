# Loop 1 WCAG 2.2 AA visual accessibility audit (D-61)

Scope: tokens in `site/src/app/globals.css` (@theme, lines 3-28), `components/ui/*`, `layout/Navbar.tsx`, `components/updates/*`.
Method: static read plus hand-computed WCAG relative luminance (sRGB linearisation). Screenshots in scratchpad `shots/before` and `before2` were viewed. No browser contrast tool was run, so figures are +/-0.05. Re-verify with axe after fixes.

## Luminance table (L)

| Token | Hex | L |
|---|---|---|
| bg | #0b1220 | 0.0061 |
| panel | #15233c | 0.0169 |
| panel-2 | #1a2a46 | 0.0232 |
| text | #e8eefb | 0.8527 |
| muted | #b8c6de | 0.5587 |
| muted-subtle | #8fa3be | 0.3575 |
| accent / brand-tint | #93c5fd | 0.5324 |
| accent-2 | #60a5fa | 0.3630 |
| brand | #3b82f6 | 0.2354 |
| button ink | #07111f | 0.0055 |

Ratio = (L1+0.05)/(L2+0.05).

## Contrast results (text tokens on surfaces)

| Pair | bg | panel | panel-2 | Verdict |
|---|---|---|---|---|
| text | 16.1 | 13.5 | 12.3 | pass |
| muted | 10.9 | 9.1 | 8.3 | pass |
| muted-subtle | 7.3 | 6.1 | 5.6 | pass |
| accent (links, Pill text) | 10.4 | 8.7 | 8.0 | pass |
| brand #3b82f6 text (wordmark Navbar.tsx:58) | 5.1 | **4.3** | 3.9 | passes on bg only; fails on panels |
| band-red #f87171 | 6.8 | 5.7 | 5.2 | pass |
| band orange/yellow/green/cyan | 8.3 / 13.0 / 13.3 / ~11 | all >7 | | pass |
| Pill: accent on rgba(125,211,252,.08) over bg | 9.0 | | | pass |
| Focus ring #93c5fd (globals.css:68-71) | 10.4 | 8.7 | 8.0 | pass (needs 3) |
| button ink #07111f on #93c5fd / #60a5fa | 10.5 / 7.5 | | | pass IF the ink actually applies (see F1) |
| white #fff on brand #3b82f6 | 3.7 | | | fail normal text; do not use |
| white on brand-deep #1d4ed8 | 6.7 | | | pass |

## Findings, ranked

### F1 (Critical, 1.4.3 Contrast Minimum) Primary buttons and CTAs render light text on light blue
- Cause: `globals.css:47-50` has an UNLAYERED `a { color: inherit; text-decoration: none; }`. In Tailwind v4 all utilities live in `@layer utilities`, and unlayered CSS beats layered CSS. So `text-[#07111f]` on every `<a>` is overridden to inherit (#e8eefb). Buttons rendered as `<button>` are unaffected, which is why it only hits links.
- Evidence: screenshot `before/updates-desktop-top.png`: "Read today's brief" and "Contact Sales" have pale text on the blue gradient. Computed: #e8eefb on #93c5fd = (0.8527+0.05)/(0.5324+0.05) = **1.55:1**; on #60a5fa = 0.9027/0.4130 = **2.19:1**. Required 4.5.
- Affected: `ui/Button.tsx:41` (primary), `Navbar.tsx:183,285`, and 19 other uses of `text-[#07111f]`/`text-[#0b1220]` (SelfAssessment 6, EvaluationScorer 5, NonprofitNavbar 2, SalesInquiryForm, NonprofitFooter, leaderboards). Same bug silently flattens every `<a className="text-muted|text-accent|...">`: in the nav, "Methodology/Research/Services" (anchors) look white while "Indexes/Tools" (buttons) look muted grey.
- Fix (one line, no token change): replace the rule with
  `@layer base { a { color: inherit; text-decoration: inherit; } }` (or delete it; Tailwind preflight already does this). Primary buttons then get 10.5:1 / 7.5:1. Expect nav and card links elsewhere to switch from white to their intended muted/accent colours: screenshot-diff all pages. Keep the `:focus-visible` rule UNLAYERED (see F5), otherwise `focus:outline-none` utilities win.
- Belt and braces: add `!text-[#07111f]` on the primary variant in Button.tsx:41 and Navbar CTAs until the global fix lands.

### F2 (High, 1.4.4 Resize Text / 1.4.12 legibility; AA-adjacent) Sub-12px text is pervasive on /updates
- Source: arbitrary sizes `text-[0.63rem]` to `text-[0.74rem]` (10.1-11.8px). 148 hits in 51 files; 97 in `components/updates/` (DailyBriefing.tsx 17, TopSignals.tsx 8, ScoreMovementCard 7, SignalCard 7, LeadSignalCard 7, BoundaryWatch 5, EvidenceLedger 4, ForwardTriggerTimeline 4, etc.). This is the ~337 elements counted by the report.
- Examples: eyebrow labels "TODAY IN 30 SECONDS" `DailyBriefing.tsx:295` (0.63rem, 10.1px, uppercase, tracking 0.18em); band/severity chips `TopSignals.tsx:393` (0.74rem); meta chips `ScoreMovementCard.tsx:142,218,236` (0.72rem); `Pill ... text-[0.65rem]` `ScoreMovementCard.tsx:243`; `ForwardTriggerTimeline.tsx:327` (0.62rem at opacity-60).
- Essential? Mostly eyebrow headings, chip labels, units and source tags: all carry meaning (severity, band, source) so they are essential, only too small. No SC has a hard pixel minimum, but 1.4.4/1.4.8 and low-vision usability fail in practice, and all-caps with wide tracking at 10px is the worst case.
- Recommendation: floor of **0.75rem (12px)** for uppercase eyebrows and chips; **0.8125rem (13px)** for any lowercase running/meta text. Collapse the 0.62-0.74 scatter into three tokens in `@theme`: `--text-micro: 0.75rem` (eyebrow/chip), `--text-meta: 0.8125rem`, `--text-body-sm: 0.875rem`; then regex-replace `text-[0.6x-0.74rem]` with `text-micro` (or `text-meta` on lowercase). Reduce tracking from 0.18em to 0.12em at 12px to avoid wrapping. A guard test: fail `npm test` on `text-\[0\.[0-6]\d*rem\]|text-\[0\.7[0-4]\d*rem\]`.
- Country page (22 elements): same pattern in `entity/EntityDetail.tsx` (5), `HistoryTimeline.tsx` (4), `EntityEvidenceCard.tsx` (3).

### F3 (High, 1.4.11 Non-text Contrast / 1.4.1 Use of Color) Form field borders and band bar
- Inputs (`ui/NewsletterSignup.tsx:221,256,301`) use `border-line` = rgba(255,255,255,.10) over bg = approx #232a36, ratio vs bg ~**1.3:1**, fails 3:1 for the control boundary. Default Button border has the same 1.3:1, but its text label identifies it, so low priority there.
- Placeholder `rgba(148,163,184,.5)` blends to approx #545f72 on the input fill, approx **2.6:1** (needs 4.5, 1.4.3).
- Fix: add `--color-line-strong: #8fa3be` (5.6-7.3:1 on all surfaces) and use `border-line-strong` on inputs, selects, checkboxes, and `pilot-print-btn`-style outlined buttons; placeholder `placeholder:text-[#8fa3be]`.
- Stacked "assessments by band" bar on /updates (`before/updates-desktop-top.png`): red/orange/yellow segments carry meaning by hue only with no inline labels or counts; adjacent red #f87171 (L 0.3295) and orange #fb923c (L 0.4140) = 1.22:1. Fix: print count and band name in or under each segment (text, >=12px) and add a 2px `bg` gap between segments; give the bar `role="img"` with an `aria-label` that lists the counts.

### F4 (Medium, 2.5.8 Target Size Minimum; 2.5.5 is AAA) Small targets
- Desktop nav links `Navbar.tsx:139-148`: 15.4px text, no padding, line box approx 23.9px high, just under 24. They pass via the spacing exemption (16px gaps) but add `py-2`.
- AI Models submenu chevron `Navbar.tsx:115-120`: `p-1` + 12px icon = 20x20px; only 4px from the "AI Models" link. Use `p-2` (28x28).
- Indexes/Tools triggers `Navbar.tsx:68,155` have no padding: add `py-2`. Both lack `aria-expanded` (4.1.2; the AI one has it).
- Mobile menu: links `py-2` = approx 40px high (pass AA). Menu toggle `p-2` + 24px = 40x40 (pass; 44 is AAA). Contact Sales mobile 42px (pass).
- Pills/Bands (`Pill.tsx:12`, `Band.tsx:19`) are static spans, not targets: pass. Chip-like links inside `ScoreMovementCard.tsx:257` (0.73rem inline link with underline, in a flex row): pass only as inline text; add `min-h-6 py-1` when it stands alone.
- Recommendation: global utility `min-h-6 min-w-6 inline-flex items-center` for icon buttons, `min-h-11` on mobile menu rows.

### F5 (Medium, 2.4.7 / 2.4.11 Focus Appearance & Not Obscured) Focus styles
- Good: global `:focus-visible { outline: 2px solid #93c5fd; outline-offset: 2px; }` (globals.css:68), 8.0-10.4:1 on all surfaces, plus a skip link (globals.css:72-86).
- Risk 1: 26 uses of `outline-none`/`focus:outline-none` (NewsletterSignup, ArchiveList, SalesInquiryForm, SelfAssessment, DefinedTerm...). They currently lose to the unlayered global rule, so the ring still appears; if anyone moves it into `@layer`, all of them vanish. Keep it unlayered and add a comment. Inputs also change the border to rgba(125,211,252,.4) on focus, which is not the indicator.
- Risk 2: `overflow-hidden` dropdown panels (`Navbar.tsx:76,123,163`) clip the 2px offset ring on first/last items; use `outline-offset: -2px` inside `[role=menu]`/panel links.
- Risk 3: sticky nav is 74px, plus sticky jump-nav on /updates; in-page anchors use `scroll-mt-24` (96px) which clears the nav alone but may not clear nav+jump-nav (2.4.11). Add `html { scroll-padding-top: 8rem; }`.
- Dropdowns: Indexes and Tools buttons are not keyboard-trapped (Escape closes). OK.

### F6 (Medium, 1.4.1 Use of Color; 1.4.3) Colour-dependent cues
- Score movement deltas (`ScoreMovementCard.tsx:24-25`): arrow glyph plus colour (#86efac / #f87171, 13.3 / 6.8:1 on bg). Passes 1.4.1 provided the glyph is not `aria-hidden` without a text alternative: ensure the number has an explicit sign or `sr-only` "up"/"down". Red/green pair is distinguishable by shape here, good.
- Navbar "Updates" red dot (`Navbar.tsx:146,265`): 7px dot, red only, no text and no `aria-hidden`/label; decorative status. Mark `aria-hidden="true"` and, if it means "new", add an `sr-only` "(new)".
- Band pills use text labels (capitalised level name), so pass.
- Link underlines: `a { text-decoration: none }` (globals.css:47-50) removes underline from in-prose links unless a component adds one (ScoreMovementCard link does). Inline links inheriting text colour (#e8eefb) would be indistinguishable (1.4.1). After the F1 fix, require `underline underline-offset-2` for links inside paragraphs (add `.prose a, p a { text-decoration: underline; }`).

### F7 (Low, 2.3.3 AAA / good practice; 2.2.2) Reduced motion
- Only `scroll-behavior: smooth` is guarded (`globals.css:30-34`, correct). Unguarded: tooltip fade `defined-term-fade-in` (globals.css:56-63, 120ms, opacity+2px shift), `transition-all`/`transition-transform` chevron rotation in Navbar. All are small and non-essential; no autoplay, parallax, carousels or `animate-*` found.
- Fix: append
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }`

### F8 (Low, 1.4.3) Minor opacity and edge cases
- `opacity-70` on muted text (`SignalStack.tsx:178`) blends to #8490a5, approx 5.8:1: passes. `opacity-60` at 0.62rem (`ForwardTriggerTimeline.tsx:327`) passes contrast (approx 4.9:1 est.) but is covered by F2.
- `rgba(255,255,255,.2/.25)` separators `·` are `aria-hidden` decoration: exempt.
- Brand wordmark #3b82f6 text at 5.1:1 on bg is fine on the navbar; do not place #3b82f6 text on `panel`/`panel-2` (4.3 / 3.9). Use `--color-accent` #93c5fd instead.

## Proposed token and class changes (dark design preserved)

| Change | Value | Result |
|---|---|---|
| globals.css:47-50 | wrap `a` reset in `@layer base` | primary button ink 10.5 / 7.5:1 |
| New `--color-line-strong` | #8fa3be | control borders 5.6-7.3:1 |
| Placeholder colour | #8fa3be (was rgba(148,163,184,.5)) | 2.6 to >=5.6:1 |
| New `--text-micro` / `--text-meta` | 0.75rem / 0.8125rem | no text under 12px |
| Brand text on panels | use #93c5fd not #3b82f6 | 4.3 to 8.7:1 |
| Keep muted / muted-subtle / accent / band colours | unchanged | all pass |
| Reduced-motion block | see F7 | |
| `html { scroll-padding-top: 8rem }` | | focus not obscured |

## Compliance mapping
1.4.3 (F1, F3 placeholder), 1.4.11 (F3), 1.4.1 (F3, F6), 1.4.4/1.4.12 (F2), 2.4.7 and 2.4.11 (F5), 2.5.8 (F4), 2.3.3 (F7), 4.1.2 (F4 menu state).

## Verification checklist for the implementer
1. Run axe or Lighthouse on `/`, `/updates`, `/updates/2026-10-14`, `/countries/afghanistan` before and after.
2. Screenshot-diff the whole site after the `a` layer fix (F1); nav and link colours will legitimately change.
3. Tab through nav, dropdowns, the newsletter form and the jump-nav at 400% zoom and 320px width.
4. Add a `test:no-subpixel-text` guard (F2) beside `test:no-stale-counts`.
