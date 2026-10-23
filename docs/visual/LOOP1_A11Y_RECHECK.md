# Loop 1 accessibility recheck on the built site (D-61)

Date: 2026-10-22. Build: `site/out` (built 21:02). Baseline: `LOOP1_A11Y_AUDIT.md` (static, hand-computed).
Method: Playwright Chromium against `site/out` served like nginx (`/x` → `x.html`, `/x/` → `x/index.html`), viewports 1366×900 and 390×844 (isMobile, touch). 10 routes: `/`, `/updates`, `/updates/2026-10-14`, `/countries`, `/country/afghanistan`, `/methodology`, `/ai-models`, `/ai-models/tracker`, `/insights`, `/contact-sales`.

## Commands

Scripts are in the session scratchpad (`a11y-recheck.mjs`, `a11y-probe.mjs`, `summ.cjs`). Copy them to `site/scripts/` if you want to re-run them.
```
MSYS_NO_PATHCONV=1 EXACT_BODY=1 node a11y-recheck.mjs C:/Users/philk/applied-compassion-benchmark/site/out a11y-results-exact.json / /updates /updates/2026-10-14 /countries /country/afghanistan /methodology /ai-models /ai-models/tracker /insights /contact-sales
node summ.cjs ./a11y-results-exact.json contrast|small|focus|target|links
node a11y-probe.mjs C:/Users/philk/applied-compassion-benchmark/site/out   # primary button, settled focus ring, skip link, mobile menu
```
How contrast is measured: every visible element with direct text (not clipped/sr-only, inside `checkVisibility`). Foreground = computed `color` × the product of ancestor `opacity`. Background = walk up the ancestors, compositing each `background-color` and each gradient layer, using every stop and keeping the worst case. The body's two radial glows are evaluated at the element's actual page position (`EXACT_BODY=1`). Without that, the worst stop of the top-right glow (rgba(96,165,250,.16)) is applied everywhere, which inflates the fails to 22 / 104 / 128 / 6 / 37 / 16 / 2 (380 at 390) / 14 / 1. Every extra fail in that pessimistic run passes on the real position. Large text = ≥24px, or ≥18.66px and bold.

## 1. Contrast (1.4.3)

**Primary button: fixed.** Measured ink `#07111f` on the gradient stops `#93c5fd` / `#60a5fa` = **10.50:1 / 7.45:1** on "Read today's brief(ing)" and the nav "Contact Sales" on `/` and `/updates`. It was 1.55 / 2.19 before. "Buy on Gumroad" (/countries) also uses `#07111f`. The other pre-fix failures now pass: footer/nav "Benchmark" wordmark (≥4.98 on the real background), Band pills (5.7-6.8, see below), muted-subtle meta text (≥4.46 everywhere, 6.9-7.2 typical).

Failing text nodes per route (identical at both widths unless noted):

| Route | Fails | Route | Fails |
|---|---|---|---|
| / | 14 | /methodology | 27 |
| /updates | 13 | /ai-models | 0 |
| /updates/2026-10-14 | 13 | /ai-models/tracker | 0 |
| /countries | 3 | /insights | 0 |
| /country/afghanistan | 2 (3 at 390) | /contact-sales | 0 |

Distinct failing pairs (need 4.5 unless noted; node counts for C3-C7 are summed over both /updates routes):

| # | Selector (component) | Sample | fg on bg | Ratio |
|---|---|---|---|---|
| C1 | `figcaption/p.text-[0.75rem].text-[rgba(148,163,184,0.55)]` (ChartFrame.tsx:104 and chart components) | "Source: Compassion Benchmark · CC-BY" | #566274 on #0b1220 … #616f84 on #223045 | **2.49-3.02** (28 nodes: / 11, /methodology 15, /countries 2) |
| C2 | `summary.inline...` "Cite this chart" (ChartFrame.tsx:115, rgba .4) | "Cite this chart" | #414b5b on #09101d | **2.01-2.16** (11 nodes) |
| C3 | `span.text-[0.8125rem].tabular-nums` no-change delta (MovementDeltaStrip.tsx:283) inside the `opacity-70` wrapper | "0" | #6e7c90 on #162234 | **3.59-3.82** (8; partly aria-hidden) |
| C4 | `span.font-mono.text-[1.1rem].font-bold` assessed score, 17.6px bold so not large (ScoreMovementCard.tsx:201, deltaColor(0) #94a3b8 × opacity .7) | "15.6", "38.8" | #6c798c on #101724 | **4.07** (8) |
| C5 | Tier chip "Journalism" #a78bfa × opacity .7 (evidence/index.tsx:183) | "Journalism" | #7d6bbe on #1a1f33 | **3.65** (4) |
| C6 | Dimension chip `#fb923c` × .7 (ScoreMovementCard.tsx:218) | "EMP −0.20" | #b86f39 on #1b1e32 | **4.21** (2) |
| C7 | `span.opacity-60.text-[0.75rem]` (ForwardTriggerTimeline.tsx:327) | "TBD" | #606c7f on #131b2a | **3.16-3.27** (4) |
| C8 | `p.text-[0.75rem].text-[rgba(148,163,184,0.7)]` (DimensionRadar.tsx:420) | "Framework diagram — representative…" | #6b788a on #0b1220 | **4.06-4.15** (3) |
| C9 | `span.text-[rgba(148,163,184,0.7)]` "Region:" (EntityDetail.tsx:536) | "Region:" | #6d7b8f on #141e30 | **3.37-3.89** |
| C10 | `span.text-[rgba(148,163,184,0.5)]` (methodology/page.tsx:1439) | "commercial relationships do not…" | #505b6c on #0b1220 | **2.70** |
| C11 | `span.opacity-50.line-through` (IntegrationPremiumDiagram.tsx:199) | "σ 3.0–5.0 → 40%" | #66748a on #152136 | **3.31-3.39** (2) |
| C12 | Band "critical" pill under the top-right glow, 390 only (Band.tsx:11) | "critical" | #f87171 on #33354c | **4.34** |

C3 to C6 share one root cause: `ScoreMovementDashboard.tsx:162` wraps the no-change/unapplied rows in `opacity-70`. The tokens themselves pass; the opacity pulls them under the threshold.

Non-text (1.4.11, form controls, measured on `contact-sales` / `countries` / `tracker`): `border-line` inputs and selects are **1.35-1.36:1** in SalesInquiryForm.tsx:20 (all inquiry fields), RankingTable.tsx:221/228/250 (search, filters) and TrackerFilters.tsx (selects). The newsletter inputs (NewsletterSignup, now `border-line-strong`) measure 4.26-4.56: pass. Placeholders: the shipped CSS resolves them to `#8fa3be` (an unlayered `::placeholder` rule), about 6.4:1 on the input fill, so they pass. Chromium's `getComputedStyle(el,'::placeholder')` can't read that colour, so this figure is computed from the rule, not read from the page.

## 2. Text under 12px

| Route | 1366 | 390 | Pre-fix |
|---|---|---|---|
| / | 7 | 7 | n/a |
| /updates, /updates/2026-10-14 | 56 | 56 | ~337 |
| /country/afghanistan | 0 | 0 | 22 |
| /countries, /methodology, /ai-models, /ai-models/tracker, /insights, /contact-sales | 0 | 0 | n/a |

The smallest left is 11.2px (`0.7rem`); 11.52px is `0.72rem`. Where it comes from:
- `/updates`: **FloorDesignationsPanel.tsx:104** dimension chips `text-[0.7rem]` (40) and **:84** index eyebrow (8). DailyBriefing.tsx:1089 ("Today's question"), 1625, 1717/1721 ("Lead signal", "Forward watch"), 2019, plus the step numerals in "Today in 30 seconds" (3) and `·` separators (2).
- `/`: ScoreLegend.tsx:58/99 legend `h4` (2, 0.7rem). app/page.tsx:387/399 (band-crossing chips, 4), :547 ("Flagship Annual Report — 2026"), :657 (framework-primer source line and its "Full methodology →" link).

## 3. Focus (2.4.7, 2.4.11), first 25 Tab stops at 1366

- `/` and `/updates`: **25/25 show a visible indicator.** The settled style is `2px solid #93c5fd`, offset 2px (8.0-10.4:1 against the surfaces). No element is hidden under the sticky header (bottom 75px): every non-header stop has top ≥ 83px. Stop 1, the skip link, is reported at top 8px, but it is `position:absolute; z-index:100` and is the topmost element at its centre. That is a false positive.
- Order: skip → logo → Indexes → AI Models → AI submenu (p-2, now ≥24px) → Updates … Contact Sales → content. Logical.
- Minor: `transition-colors` also animates `outline-color`, so for about 150ms the ring passes through dark intermediate colours (sampled rgb(71,99,133), 3.0:1 against the bg, on the primary button). It is cosmetic, but the indicator is weakest in its first frames.

## 4. Target size (2.5.8) at 390

**0 failures.** Undersized non-inline targets (raw count, all within the spacing exception): / 74, /updates 121, /updates/2026-10-14 120, /countries 266, /country/afghanistan 67, /methodology 56, /ai-models 51, /ai-models/tracker 177, /insights 38, /contact-sales 40. Nearly all are text links 19-23px tall with ≥8px gaps (table cells, the footer `a.block.mb-2` at 171×23, tracker source links at 202×22). The mobile menu toggle is 40×40, its rows are 358×41, and Contact Sales is 128×42. Near misses to harden: "Cite this chart" `summary` **73×16**; EntityDetail `details > summary` at 19-20px; DefinedTerm spans at 17-18px.

## 5. Links in paragraphs (1.4.1)

**Pass.** Every in-prose link (inline `a` inside p/li/dd/td that has other text) is underlined: / 6, /updates 2, /methodology 12, /ai-models 18, /ai-models/tracker 4, /countries 0 real. The only flag, "Buy on Gumroad" in a table cell, is a filled button and a false positive. Header and nav links and buttons: **0 underlined**. Underlined outside prose: the `/ai-models` jump list (10 items) and the breadcrumbs on tracker and insights. Both are acceptable; just keep them consistent.

## Ranked fix list

1. **ChartFrame.tsx:104,115**: caption `text-[rgba(148,163,184,0.55)]` → `text-muted-subtle` (#8fa3be, ≥5.6:1 on panels). The "Cite this chart" summary `rgba(...,0.4)` → `text-muted-subtle`, plus `inline-flex min-h-6 items-center py-1` (fixes C1, C2 and the 16px target). Apply the same swap to the other 0.55 captions under `components/charts/` (AnchorLadder, BandDistributionBar, BandScaleStrip, ConsistencyStepChart, DimensionProfileBar, EvidencePyramid, IntegrationPremiumDiagram, PipelineFlowDiagram) and to `app/indexes/page.tsx`. That clears 39 of the 72 failing nodes (counted at 1366).
2. **ScoreMovementDashboard.tsx:162**: drop `opacity-70` from the wrapper. De-emphasise those rows with `text-muted` and a lighter border instead (fixes C3-C6, 11 of the 13 nodes on each /updates route).
3. **FloorDesignationsPanel.tsx:84,104; DailyBriefing.tsx:1089,1625,1717,1721,2019; ScoreLegend.tsx:58,99; app/page.tsx:387,399,547,657**: `text-[0.7rem]` / `text-[0.72rem]` → `text-[0.75rem]` (or the `--text-micro` token), with tracking trimmed to ≤0.12em. That clears all 63 sub-12px nodes. The guard proposed in F2 does not exist yet: add `test:no-subpixel-text` failing on `text-\[0\.(6\d*|7[0-4]\d*)rem\]`.
4. **SalesInquiryForm.tsx:20, RankingTable.tsx:221/228/250, TrackerFilters.tsx**: `border-line` → `border-line-strong` on inputs and selects (1.35 → ≥4.3:1, 1.4.11).
5. **ForwardTriggerTimeline.tsx:327** (`opacity-60` → `text-muted-subtle`), **DimensionRadar.tsx:420** and **EntityDetail.tsx:536** (`rgba(148,163,184,0.7)` → `text-muted-subtle`), **methodology/page.tsx:1439** (`rgba(...,0.5)` → `text-muted-subtle`), **IntegrationPremiumDiagram.tsx:199** (`opacity-50` → `text-muted-subtle line-through`; keep the strike, drop the opacity). Fixes C7-C11.
6. **globals.css `:focus-visible`**: add `transition: outline-color 0s` (or have the components use `transition-[color,background-color,border-color]`) so the ring appears at full contrast immediately.
7. **Band.tsx:11** critical pill: text `#fca5a5` (or tint alpha .10 → .06) for headroom under the hero glow (C12, 4.34 at 390).
8. Target hardening (passes today on spacing): `min-h-6` on EntityDetail `summary` rows and on the DefinedTerm triggers.
