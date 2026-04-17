# Compassion Benchmark — Newsletter Design Specification V2

> Version: 2.0  
> Date: 2026-04-17  
> Author: UX Designer agent  
> Status: Design phase — do not implement until product-owner review  
> Downstream recipients: frontend-engineer, qa-engineer, product-manager

---

## 1. Positioning Statement

The redesigned newsletter should feel like **The Economist's Espresso crossed with a Bloomberg terminal alert, dark-mode native, data-first, institutionally credible without being cold.**

More specifically:

- **From Economist Espresso**: editorial compression, the discipline of saying the most important thing in the fewest words, typographic hierarchy that signals authority without decoration
- **From Bloomberg / FT Moral Money**: data embedded in prose, semantic color, the implicit assumption that the reader is a professional who does not need hand-holding
- **From Axios Smart Brevity**: the "Why it matters" logic applied to every score movement — not stated explicitly, but structured into the card so the reader derives it without being told
- **From Our World in Data / Benedict Evans**: treating the data as the primary content, not an illustration of prose
- **From Stratechery**: findings that synthesize, not summarize — the reader learns something new from the editorial layer, not just confirmation of what the cards already said

What it should NOT feel like: a SaaS product newsletter, a nonprofit digest, a blog recap, or any publication that uses countdown timers, gradient hero banners, or "exciting news" framing.

The single test: if a senior ESG analyst at a pension fund opens this on a Tuesday morning alongside Bloomberg Briefs and FT Moral Money, does it belong in that stack? V1 does not yet pass that test. V2 must.

---

## 2. Reference Analysis — Design Patterns from World-Class Newsletters

The following patterns were synthesized from studying The Economist Espresso, Axios, Stratechery, FT Moral Money, Bloomberg Evening Briefing, Benedict Evans, Our World in Data, Exponential View, Morning Brew, Platformer, MIT Technology Review The Download, and Responsible Investor. Key observations follow.

### 2.1 Section Hierarchy and Reading Order

World-class institutional newsletters use a consistent three-tier hierarchy:

**Tier 1 — The Lede (top 300px)**: One statement that tells the reader whether this issue matters to them. The Economist Espresso opens every issue with a declarative that could stand alone as a push notification. Bloomberg Evening Briefing leads with a narrative hook in 2 sentences. Both assume the reader has 3 seconds before they decide to scroll or archive.

**Tier 2 — The Data Layer (the body)**: This is where entity-specific information lives. FT Moral Money and Responsible Investor both present score movements and company actions in compressed card or table form — the reader is not expected to read every word, but every item must be scannable in isolation.

**Tier 3 — The Synthesis Layer (findings / signals)**: Exponential View numbers its insights (1. 2. 3.) and uses a consistent format: observation → implication → why-now. Stratechery provides analysis that cannot be derived from the data cards alone. This is what makes deep readers return — the synthesis is the editorial value-add, not the data itself.

### 2.2 Typography Patterns

- **The Economist / FT**: Uses a heavier weight for entity names and numbers than for surrounding prose — weight is the primary hierarchy signal, not size alone. Small size, high weight creates density without visual noise.
- **Axios**: Two-weight system — the "Headline" is bold and large; everything else is normal weight at a consistent small size. This creates extreme scannability at the cost of editorial texture.
- **Benedict Evans**: Almost entirely uniform type — small, regular weight, high line-height. Authority comes from the content, not the typography. Works because the audience is specialists who don't need visual scaffolding.
- **Our World in Data**: Uses a visual hierarchy between data labels (bold, numeric) and surrounding descriptive text (lighter, smaller). Numbers are always the most visually prominent element on any line containing a number.

For Compassion Benchmark: the right model is closer to Economist/FT than Axios. We need editorial texture (the numbered findings, the hierarchical score cards) while making numbers the dominant visual element within each card.

### 2.3 Color Discipline

- Best-in-class newsletters use color for **semantic meaning only** — never decoration. FT Moral Money uses a single red for negative data and a single green for positive data, consistently, throughout the entire publication. The reader learns the code in one issue.
- Bloomberg uses a terminal-derived yellow-on-dark for key data labels, matching their product vocabulary. This consistency builds brand trust.
- The worst pattern (seen in Morning Brew and many SaaS newsletters): using multiple accent colors decoratively, which causes readers to stop expecting color to mean anything.
- Dark-mode newsletters (very few exist at institutional quality): Apple's dark mode forces white backgrounds on many HTML emails unless `color-scheme` is declared and dark-mode overrides are explicit. The current V1 template handles this correctly with the meta tag — V2 must preserve this.

### 2.4 Data Treatment

- **Our World in Data**: Uses simple percentage-width bars built from HTML `<td>` cells with background colors. No SVG, no images. These work in email because they degrade to colored rectangles even in the most restrictive clients.
- **FT Alphaville / Bloomberg**: Uses inline numbers in prose, bolded. Does not use bar charts in email — considers them a web-only pattern. The numbers speak.
- **Exponential View**: Uses indented blockquote-style treatment for key statistics — pulls the number out of prose into its own line with a visual treatment (left border or indent). This is the "pull quote for data" pattern.
- The current V1 Unicode bar (▓▓▓▓▓░░░░░) is serviceable but carries no band threshold information. A reader cannot tell from the bar alone whether 46.9 is Critical or Functional. The bar needs to encode band boundaries.

### 2.5 Authority Signals

- **Independence statements**: FT Moral Money and Responsible Investor both include editorial independence language in or near the header, not just the footer. This signals to readers that the publication's authority is structural, not claimed.
- **Methodology visibility**: Every issue of a credible research publication references its methodology. The current V1 template does this in the footer only. Moving a methodology signal to the header (even as small subtext) significantly increases perceived authority on first open.
- **Specificity**: Platfomer, The Information, and Stratechery achieve authority through hyper-specific sourcing — not "reports indicate" but "according to the NLRB filing dated April 2, 2026." V1 already does this in evidence bullets. V2 must preserve and reinforce this pattern.
- **Edition number / volume number**: The Economist, FT, and most institutional publications include a volume/issue number. It signals ongoing publication and gives subscribers a sense of belonging to a series. V1 lacks this entirely.

### 2.6 Mobile Scaling

- Bloomberg and FT use a simple single-column layout throughout — no multi-column responsiveness required because the design is already single-column. This is the correct approach for data-heavy email.
- The pattern that consistently breaks on mobile: cards with side-by-side data (entity name left, score right) where the right column wraps below the left awkwardly. The `display:block` override in media queries handles this but requires explicit testing.
- Touch target minimum: 44px height for any tappable element (Apple HIG). V1 specifies this. V2 must maintain.

### 2.7 CTA Placement and Tone

- Best-in-class institutional CTAs: **The Information** uses a single line at the end of a section — "Subscribers can read the full report here." No button, no urgency, no FOMO. The CTA is informational, not promotional.
- **FT Moral Money** institutional services CTA is always framed as an invitation: "If you're working on [specific use case], our research team can help. Reply to this email." The specificity of the use case makes it feel relevant rather than generic.
- **Exponential View**: No visible CTAs in the editorial body. All monetization is in the footer, separated by a clear visual break. This creates an editorial clean-room that increases trust and long-term engagement.
- For Compassion Benchmark: the current placement (CTA 1 after score changes, CTA 2 before footer) is correct. The tone of CTA 2 is already close to best-in-class. CTA 1 needs to read more like a reference than a sell.

### 2.8 Lede / Hook Strategies

- **Economist Espresso**: Opens with the most important single fact, stated declaratively. "The US added 339,000 jobs in May." Not "This week saw significant employment growth."
- **Axios**: "Here's what you need to know" framing — explicitly tells the reader this is a briefing, not a story. Efficient but generic.
- **Platformer**: Opens with a narrative sentence that implies stakes. "Last Tuesday, a document circulated inside Meta that most of its employees were not supposed to see."
- **Stratechery**: Opens with a historical or contextual frame, then pivots to the week's data. Creates intellectual engagement before delivering the news.

For Compassion Benchmark: the opening line should be the single most consequential fact from the week, stated declaratively. Not "This week: 19 entities assessed." That's pipeline metadata, not news. The news is "Four AI labs fell a combined 88 points this week — the largest sector-wide collapse in the index's history." Then the stats follow. The current template inverts this: it leads with pipeline stats and buries the significance.

---

## 3. Typography System

All type is rendered inline (no webfont dependencies). Font stack is system UI throughout. No serif — the publication is data-forward, not editorial-magazine.

### Font Stack (all roles)

**Sans-serif (primary)**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`

**Monospace (score numbers, deltas only)**: `'SF Mono', 'Fira Code', Consolas, 'Courier New', monospace`  
Use monospace for the score numbers and delta values in score cards only. This creates tabular alignment, signals measurement precision, and visually separates data from editorial text. Do NOT use monospace for body text, labels, or any prose.

### Type Scale

| Role | Size | Weight | Line-height | Letter-spacing | Color token |
|---|---|---|---|---|---|
| Masthead wordmark | 13px | 700 | 1.0 | 0.10em | `accent` (#7dd3fc) |
| Issue label (eyebrow) | 11px | 600 | 1.0 | 0.08em | `muted` (#8fa3be) |
| Edition / date range | 12px | 400 | 1.0 | 0.02em | `muted` (#8fa3be) |
| Lede sentence | 17px | 600 | 1.45 | -0.01em | `primary` (#e8eefb) |
| Section label (uppercase) | 10px | 700 | 1.0 | 0.10em | `accent` (#7dd3fc) |
| Entity name | 15px | 700 | 1.2 | -0.01em | `primary` (#e8eefb) |
| Index / category label | 11px | 500 | 1.0 | 0.02em | `muted` (#8fa3be) |
| Score (published, old) | 13px | 400 | 1.0 | 0 | `muted` (#8fa3be) — monospace |
| Score (new, current) | 20px | 700 | 1.0 | -0.02em | band color — monospace |
| Delta value | 13px | 600 | 1.0 | 0 | direction color — monospace |
| Band label | 12px | 600 | 1.0 | 0.02em | band color |
| Confidence | 12px | 400 | 1.0 | 0 | `muted` (#8fa3be) |
| Evidence bullet | 13px | 400 | 1.55 | 0 | `secondary` (#b8c6de) |
| Finding number | 12px | 700 | 1.0 | 0.04em | `accent` (#7dd3fc) — tabular |
| Finding body | 14px | 400 | 1.65 | 0 | `secondary` (#b8c6de) |
| Signal type label | 10px | 700 | 1.0 | 0.08em | signal color (varies) |
| Signal body | 13px | 400 | 1.55 | 0 | `secondary` (#b8c6de) |
| Summary ticker stat label | 11px | 400 | 1.0 | 0.04em | `muted` (#8fa3be) |
| Summary ticker stat value | 14px | 700 | 1.0 | -0.01em | `primary` (#e8eefb) — monospace |
| Confirmations entity | 13px | 600 | 1.8 | 0 | `primary` (#e8eefb) |
| Confirmations data | 13px | 400 | 1.8 | 0 | `muted` (#8fa3be) |
| CTA body | 13px | 400 | 1.6 | 0 | `muted` (#8fa3be) |
| CTA link | 13px | 500 | 1.6 | 0 | `accent` (#7dd3fc) |
| Footer independence | 12px | 400 | 1.6 | 0 | `muted` (#8fa3be) |
| Footer nav link | 12px | 400 | 2.0 | 0 | `accent` (#7dd3fc) |
| Footer legal | 11px | 400 | 1.6 | 0 | `dim` (#5a6a7e) |

### Typography Rules

1. **Weight is the primary hierarchy signal.** Size changes are secondary. An entity name at 15px/700 outranks body text at 14px/400 despite a 1px size difference.
2. **Monospace is reserved for measured values.** Score numbers, deltas, and the summary ticker stats. This creates a visual signal: "this is a measured number, not a label."
3. **Do not mix weights within a single prose sentence.** Bold inline within evidence bullets or findings body is prohibited — the numbered label carries the hierarchy, the body is uniform.
4. **Letter-spacing above zero only on all-caps labels.** The section eyebrows and masthead wordmark get 0.08–0.10em. Everything else: 0 or slightly negative for large weights.
5. **Line-height for data (score, delta): 1.0.** Line-height for prose (finding body, signal body): 1.55–1.65. Never apply prose line-height to data rows.

---

## 4. Color System

### 4.1 Base Palette (Dark Theme — Default)

| Token | Hex | RGB equivalent | Usage |
|---|---|---|---|
| `bg-outer` | #080e19 | 8, 14, 25 | Outer email body wrapper |
| `bg-container` | #0b1220 | 11, 18, 32 | Email container background |
| `bg-card` | #111827 | 17, 24, 39 | Score change cards, CTA boxes |
| `bg-card-raised` | #141d2e | 20, 29, 46 | Hover state (web only — not applicable in email) |
| `bg-ticker` | #0d1525 | 13, 21, 37 | Summary ticker background |
| `text-primary` | #e8eefb | 232, 238, 251 | Headlines, entity names, lede |
| `text-secondary` | #b8c6de | 184, 198, 222 | Body text, finding body, signal body |
| `text-muted` | #8fa3be | 143, 163, 190 | Evidence bullets, captions, CTAs, footer independence |
| `text-dim` | #5a6a7e | 90, 106, 126 | Footer legal, score arrows, separators |
| `accent` | #7dd3fc | 125, 211, 252 | Section labels, links, wordmark, finding numbers |
| `border-subtle` | rgba(255,255,255,0.06) | — | Section dividers |
| `border-medium` | rgba(125,211,252,0.12) | — | Header bottom border, card borders (neutral) |

### 4.2 Band Colors (5-tier scale)

These are semantic colors. They encode measured status. They must never be used decoratively.

| Band | Label | Hex | Range | WCAG contrast on bg-card |
|---|---|---|---|---|
| Band 5 | Exemplary | #7dd3fc | 80–100 | 6.8:1 — PASSES AA |
| Band 4 | Established | #86efac | 60–79 | 6.4:1 — PASSES AA |
| Band 3 | Functional | #fcd34d | 40–59 | 8.9:1 — PASSES AA |
| Band 2 | Developing | #fb923c | 20–39 | 5.2:1 — PASSES AA |
| Band 1 | Critical | #f87171 | 0–19 | 4.8:1 — PASSES AA (barely) |

Note on Critical (#f87171): At 4.8:1 on #111827, this passes AA for normal text (4.5:1 minimum) but does NOT pass AAA (7:1). This is acceptable for the current design. If the band label font-weight is 600 or above, the effective contrast is perceived higher. Do not reduce the Critical band color toward a darker red — it would no longer be legible in forced-light mode.

### 4.3 Direction Colors (Delta Signals)

| Signal | Hex | Usage |
|---|---|---|
| `delta-large-down` | #f87171 | Delta ≤ −10 pts (Critical band color, double duty) |
| `delta-small-down` | #fb923c | Delta −1 to −9.9 pts |
| `delta-large-up` | #86efac | Delta ≥ +10 pts |
| `delta-small-up` | #34d399 | Delta +1 to +9.9 pts |
| `delta-flat` | #5a6a7e | Delta 0.0 (confirmation, no change) |

The delta direction color is applied to: the new score number, the delta value text, and the left border of evidence bullets. The card border color is a 30% opacity version of the same direction color.

### 4.4 Signal Type Colors

| Signal type | Hex | Usage |
|---|---|---|
| Regulatory | #fb923c | EU enforcement dates, legal deadlines |
| Litigation | #f87171 | Active lawsuits, investigations |
| Financial | #fcd34d | Market, M&A, economic exposure |
| Governance | #7dd3fc | Leadership, accountability, board-level |

This is new in V2. V1 uses a single generic "Risk" label in orange for all signals. Differentiating signal type adds meaningful information for ESG analysts who track regulatory risk separately from litigation risk.

### 4.5 Light Mode Overrides

The following are applied via `@media (prefers-color-scheme: light)` in the `<style>` block. These are progressive enhancement — the email must be readable in dark mode without them.

| Dark token | Light override |
|---|---|
| `bg-outer` #080e19 | #f0f2f5 |
| `bg-container` #0b1220 | #ffffff |
| `bg-card` #111827 | #f4f6f9 |
| `bg-ticker` #0d1525 | #eef0f4 |
| `text-primary` #e8eefb | #0f172a |
| `text-secondary` #b8c6de | #334155 |
| `text-muted` #8fa3be | #64748b |
| `text-dim` #5a6a7e | #94a3b8 |
| `accent` #7dd3fc | #0284c7 |
| `border-subtle` rgba(255,255,255,0.06) | rgba(0,0,0,0.08) |
| `border-medium` rgba(125,211,252,0.12) | rgba(2,132,199,0.15) |
| Band colors | No change — all 5 band colors pass AA on white background |

### 4.6 Gmail Forced Dark Mode Behavior

Gmail's Android app applies forced dark mode by inverting backgrounds and inverting or adjusting text colors. To survive this:

- Declare `color-scheme: dark` in `<meta>` and `:root` (already in V1 template)
- Add `data-ogsc` attribute pattern is unreliable — prefer the `:root` declaration
- Background colors on inline styles will be respected; Gmail will NOT invert them if the `color-scheme` declaration is present
- Test specifically: #0b1220 background with #e8eefb text. Gmail dark mode should leave this untouched.
- The band dot (8px colored circle) must have a text equivalent nearby — Gmail sometimes strips background-color from small elements

---

## 5. Layout Grid and Spacing Scale

### Base Unit

**4px base unit.** All spacing values are multiples of 4px.

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight internal spacing within data rows |
| `space-2` | 8px | Between evidence bullets, between band label and score bar |
| `space-3` | 12px | Internal card padding (top/bottom), between card header and evidence |
| `space-4` | 16px | Standard component gap, mobile horizontal padding |
| `space-5` | 20px | Card internal padding (left/right), section header bottom padding |
| `space-6` | 24px | Between cards, between section body and next divider |
| `space-7` | 28px | Container horizontal padding (desktop), major section gap |
| `space-8` | 32px | Large section separation |
| `space-10` | 40px | Pre-footer breathing room |

### Container

- Max width: 600px
- Horizontal padding: 28px left and right (desktop), 16px (mobile)
- The container background (#0b1220) sits against the outer body (#080e19) — the 3-shade difference creates a subtle frame that signals a contained document

### Card Treatment

- Background: #111827 (3 shades lighter than container)
- Border: 1px solid, color = 30% opacity of delta direction color
- Border-radius: 12px — use `border-radius` on `<td>` with `border-collapse:separate` on the outer `<table>`
- Internal padding: 20px all sides
- Gap between cards: 16px

### Dividers

Two divider types:

**Section divider** (between major sections): `border-top: 1px solid rgba(255,255,255,0.06)` — very subtle, more of a breath than a wall.

**Header divider** (below masthead): `border-bottom: 1px solid rgba(125,211,252,0.12)` — slightly more visible, anchors the header zone.

Do not use horizontal rules or decorative elements. The dividers are the only structural lines in the design.

---

## 6. Section Inventory (Redesigned)

The redesigned section order addresses two problems with V1:

1. **The lede buries the news.** Pipeline stats ("19 entities assessed") are not the news. The news is the most significant finding. V2 opens with that.
2. **The full change table is absent.** When there are 13 changes in a week, showing only 5 cards means power readers (ESG analysts) miss 8 changes. V2 adds a compressed change table above the detailed cards.

### Section Order V2

```
┌─────────────────────────────────────────────────────────┐
│  PREHEADER (hidden, 90 chars)                           │
├─────────────────────────────────────────────────────────┤
│  MASTHEAD                                               │
│  Wordmark · Edition # · Date range · Issue label        │
│  Methodology subtext (1 line, 11px)                     │
├─────────────────────────────────────────────────────────┤
│  LEDE BLOCK                                             │
│  1 sentence, 17px/600. The most significant fact.       │
│  NOT pipeline stats. Synthesis, not inventory.          │
├─────────────────────────────────────────────────────────┤
│  SUMMARY TICKER (NEW)                                   │
│  Horizontal row: 5 stats (assessed, changes, band        │
│  changes, top delta entity, confirmations)              │
│  Replaces the opening line in V1                        │
├─────────────────────────────────────────────────────────┤
│  [DIVIDER]                                              │
├─────────────────────────────────────────────────────────┤
│  SECTION: SCORE MOVEMENTS                               │
│  Sub-section A: Compressed change table (ALL changes)   │
│  Sub-section B: Detailed cards (top 3–5 by |delta|)     │
├─────────────────────────────────────────────────────────┤
│  CTA 1: Research upsell (text-only, 1 line)             │
├─────────────────────────────────────────────────────────┤
│  [DIVIDER]                                              │
├─────────────────────────────────────────────────────────┤
│  SECTION: SCORES CONFIRMED                              │
│  Compressed table (grouped by index)                    │
├─────────────────────────────────────────────────────────┤
│  [DIVIDER]                                              │
├─────────────────────────────────────────────────────────┤
│  SECTION: FINDINGS                                      │
│  01 / 02 / 03 numbered, larger body type                │
├─────────────────────────────────────────────────────────┤
│  [DIVIDER]                                              │
├─────────────────────────────────────────────────────────┤
│  SECTION: SIGNALS                                       │
│  Typed by signal category (Regulatory/Litigation/etc.)  │
├─────────────────────────────────────────────────────────┤
│  [DIVIDER]                                              │
├─────────────────────────────────────────────────────────┤
│  CTA 2: Institutional services (boxed, centered)        │
├─────────────────────────────────────────────────────────┤
│  [DIVIDER]                                              │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  Pipeline stats · Independence · Nav links · Unsub      │
└─────────────────────────────────────────────────────────┘
```

Key structural changes from V1:

1. **Pipeline stats moved to footer.** They are operational metadata, not editorial content. ESG analysts do not lead with operational stats.
2. **Lede block replaces opening line.** Single most significant finding, not a list of counts.
3. **Summary ticker replaces opening line stats.** Stats are preserved but presented as a scannable horizontal bar, not a prose sentence.
4. **Compressed change table added above detail cards.** Lets power readers see all changes at once without scrolling through 5 full cards.
5. **Methodology reference added to masthead.** One-line reference, 11px, links to /methodology.
6. **Confirmations now grouped by index.** Flat alphabetical list is harder to parse than index-grouped table.
7. **Signal type labels replace generic "Risk" label.** Regulatory / Litigation / Financial / Governance.
8. **Weekly stats bar moves to footer.** Above independence statement and nav links.

---

## 7. Component Specifications

### 7.1 Issue Masthead

**Purpose**: Establish authority, date, and edition identity. Signal institutional continuity.

**Wire frame:**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  COMPASSION BENCHMARK              Weekly Briefing   │
│  compassionbenchmark.com/methodology    Apr 11–17    │
│  ─────────────────────────────────────────────────  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Visual specification:**

- Row 1, left cell: "COMPASSION BENCHMARK" — 13px, 700 weight, #7dd3fc, letter-spacing 0.10em, uppercase. This is text, not an image.
- Row 1, right cell: "Weekly Briefing" — 12px, 500 weight, #8fa3be, right-aligned.
- Row 2, left cell: Link "compassionbenchmark.com/methodology" — 11px, 400 weight, #5a6a7e, no underline, links to methodology page. This is the authority anchor — it appears in every issue.
- Row 2, right cell: Date range — "Apr 11–17, 2026" — 12px, 400 weight, #8fa3be, right-aligned. Use en-dash (–), not hyphen.
- Bottom border: 1px solid rgba(125,211,252,0.12)
- Padding: 20px 28px (desktop), 16px (mobile)
- No edition number in V2 (open question — see section 13)

**Edition number discussion (deferred)**: Including an edition number (#14, Vol. 1 No. 14) would significantly increase institutional authority signals. FT, The Economist, and Bloomberg all use volume/issue tracking. However, this requires a counter in the generator. Flagged as a product-owner decision.

**Content rules:**
- Wordmark: always "COMPASSION BENCHMARK" — no variation
- Date format: "Apr 11–17, 2026" — three-letter month abbreviation, day range with en-dash, four-digit year
- Methodology link text: always "compassionbenchmark.com/methodology" — do not abbreviate or change

**Light mode override**: Replace #7dd3fc wordmark with #0284c7. Replace #5a6a7e methodology link with #64748b.

**Outlook note**: No `border-radius` on the masthead cell — it's full-width and flush. No VML needed.

---

### 7.2 Lede Block

**Purpose**: Give the reader the single most important fact of the week, stated as a declarative sentence. The reader should know whether this issue is relevant to their portfolio, coverage area, or research domain within 3 seconds of seeing it.

**Wire frame:**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Four AI labs fell a combined 88 points this week    │
│  — the largest sector-wide collapse in the index.    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Visual specification:**

- Font: 17px, weight 600, color #e8eefb, line-height 1.45
- No section label above it — the lede stands alone, immediately below the masthead
- No bold inline — the entire sentence is the same weight
- Max length: 160 characters (2 lines at 600px width). If the generator produces a longer sentence, truncate at the last complete clause before 160 chars.
- Bottom margin: 20px before the summary ticker

**Content rules (for generator):**

The lede sentence must be the editorial synthesis, not the pipeline stats. Valid lede strategies:

- **Sector pattern**: "Four AI labs fell a combined 88 points this week — the largest sector-wide collapse in the index's history."
- **Top mover**: "Mistral AI dropped 29.5 points in a single assessment, the deepest single-entity downgrade in pipeline history."
- **Band change concentration**: "Seven entities crossed a band boundary this week — more than any prior assessment cycle."
- **Cross-sector finding**: "Every entity assessed across healthcare, AI, and sovereign sectors received a downgrade proposal this week."
- **Quiet week variant**: "Sixteen confirmations and no band changes this week — the most stable assessment cycle in three months."

The generator should evaluate: (1) total |delta| across all changes, (2) band change count, (3) single-entity top |delta|, (4) sector concentration, (5) confirmation-only week. The largest of these signals is the lede.

The lede must NEVER be: "This week: 19 entities assessed across 5 indexes." That is the ticker, not the lede.

**Failure state (no significant data)**: "Sixteen entities confirmed within tolerance this week. No score changes applied." This is the quiet-week lede — understated and accurate.

---

### 7.3 Summary Ticker (New Component)

**Purpose**: Compress the operational pipeline stats into a scannable horizontal bar that gives power readers the full picture at a glance, without requiring them to read through full cards.

**Wire frame (desktop):**

```
┌──────────────────────────────────────────────────────┐
│  ASSESSED      CHANGES     BAND CHANGES  CONFIRMED   │
│     29           13             7           16        │
└──────────────────────────────────────────────────────┘
```

**Wire frame (with top mover highlight, preferred):**

```
┌──────────────────────────────────────────────────────┐
│  ASSESSED   CHANGES   BAND ↕   TOP MOVE   CONFIRMED  │
│     29        13        7      −29.5 pts     16       │
│                              Mistral AI               │
└──────────────────────────────────────────────────────┘
```

**Visual specification:**

- Background: #0d1525 (slightly lighter than container — creates a subtle "inset panel" effect)
- Border: 1px solid rgba(125,211,252,0.08) — very subtle
- Padding: 16px top/bottom, 20px left/right
- Layout: 5-column table, equal width columns, centered text
- Stat label: 10px, 700 weight, #8fa3be, uppercase, letter-spacing 0.08em
- Stat value: 16px, 700 weight, #e8eefb, monospace font
- "Top Move" value: colored by delta direction (e.g., #f87171 for −29.5 pts)
- "Top Move" entity: 11px, 400 weight, #8fa3be, below the value, same cell
- Vertical separator between columns: none — use column spacing only. Avoid pipe characters as separators in table cells (they create accessibility noise).
- Bottom margin: 24px before section divider

**Mobile (≤480px)**: Collapse to 2 rows of 2–3 cells. Stack labels above values. Full-width.

```
ASSESSED    CHANGES     BAND ↕
   29         13           7

TOP MOVE             CONFIRMED
−29.5 pts               16
Mistral AI
```

**Content rules:**
- "ASSESSED": total entities assessed in the weekly period (not daily)
- "CHANGES": total score changes proposed (same as proposals generated)
- "BAND ↕": band changes (crossings of 20/40/60/80 threshold)
- "TOP MOVE": the single largest |delta|, colored by direction, with entity name below
- "CONFIRMED": confirmations count

**Outlook note**: 5-column table with fixed widths. Use `width` attribute on each `<td>` (e.g., width="20%"). Avoid percentage widths on the outer table in Outlook 2013 — use fixed pixel widths for the container.

---

### 7.4 Score Movement — Compressed Change Table (New Sub-Component)

**Purpose**: Show ALL score changes in a single scannable table so power readers can assess the full picture before reading individual cards. ESG analysts building portfolio exposure lists need all 13 changes, not just the top 5. The current V1 approach (show 5 cards, link out for the rest) is a significant gap for this audience.

**Recommendation**: Place the compressed table ABOVE the detailed cards, under the "Score Movements" section label.

**Wire frame:**

```
SCORE MOVEMENTS  ───────────────────────────────────────

  All changes · Apr 11–17, 2026 · sorted by |delta|

  Entity                Index        Score      Δ    Band
  ─────────────────────────────────────────────────────
  Mistral AI            AI Labs   76.4 → 46.9  ↓29.5  ↕
  Anthropic             AI Labs   90.9 → 68.8  ↓22.1  ↕
  Johnson & Johnson     F500      48.4 → 27.5  ↓20.9  ↕
  Israel                Countries 27.8 → 8.8   ↓19.0  ↕
  CVS Health            F500      50.0 → 31.3  ↓18.7  ↕
  xAI/Grok              AI Labs   18.3 → 2.2   ↓16.1
  Rwanda                Countries 41.8 → 30.0  ↓11.8  ↕
  United States         Countries 35.5 → 25.0  ↓10.5
  OpenAI                AI Labs   40.6 → 30.5  ↓10.1
  Alphabet (Google)     F500      51.6 → 42.2  ↓9.4
  UnitedHealth Group    F500      16.9 → 10.9  ↓6.0
  Walmart               F500      33.9 → 28.9  ↓5.0
  Amazon                F500      21.6 → 17.2  ↓4.4   ↕

  Detailed cards for top 5 changes follow below.
```

**Visual specification:**

- Table: full-width, no outer border, no card background (sits on container background)
- Column headers: 10px, 700 weight, #5a6a7e, uppercase, letter-spacing 0.08em
- Header row bottom border: 1px solid rgba(255,255,255,0.08)
- Data rows: alternating backgrounds — odd rows #0b1220 (container color), even rows rgba(255,255,255,0.02) — very subtle zebra striping for dense tables
- Entity column: 13px, 600 weight, #e8eefb
- Index column: 13px, 400 weight, #8fa3be
- Score column: 13px, 400 weight monospace — old score in #5a6a7e, arrow in #5a6a7e, new score in band color
- Delta column: 13px, 600 weight monospace, direction color
- Band change column: "↕" symbol in #7dd3fc if band changed; empty if not. Width: 20px.
- Row padding: 8px top/bottom, 4px left/right per cell
- Section header: "All changes · [date range] · sorted by |delta|" — 11px, 400 weight, #5a6a7e, italic, above the table

**Mobile (≤480px)**: The 5-column table is too wide for mobile. Collapse to 3 columns: Entity | Δ | Band. Hide the Score and Index columns on mobile (add class `mobile-hide` to those `<td>` elements).

```
Entity                Δ        Band ↕
Mistral AI          ↓29.5       ↕
Anthropic           ↓22.1       ↕
Johnson & Johnson   ↓20.9       ↕
```

**Edge cases:**
- 0 changes this week: Show "No score changes were applied this week. [N] scores confirmed." No table rendered.
- 1–2 changes: Skip the compressed table; go directly to detail cards.
- More than 15 changes: Hard cap the table at 15 rows. Add "... and N more" row at bottom, linking to /updates.

**Content rules:**
- Sort: by |delta| descending — largest absolute change first
- Index column abbreviations: "AI Labs", "F500" (Fortune 500), "Countries", "Robotics", "US States", "US Cities", "Global Cities"
- Do not link entity names in the compressed table — save links for the detail cards

---

### 7.5 Score Movement — Detail Card (Redesigned)

**Purpose**: Give the reader everything they need to understand a single score change in 2 seconds (scanner) or 20 seconds (deep reader). The hierarchy must separate these two reading modes visually.

The key structural improvement over V1: add a **dimension profile strip** for the top 1–2 changes. This is what serious ESG/benchmark publications do — it shows the shape of the score, not just the composite number.

**Wire frame — top-tier card (with dimension strip):**

```
┌──────────────────────────────────────────────────────┐
│                                              Applied  │
│  Mistral AI                          AI Labs          │
│                                                      │
│  76.4  →  46.9                       ↓ 29.5 pts      │
│  Established → Functional                            │
│                                         High conf.   │
│  ──────────────────────────────────────────────────  │
│  ▌ Enkrypt AI found Pixtral models 60× more likely   │
│    to generate CSAM than OpenAI GPT-4o               │
│  ▌ 68% adversarial success rate — refusal            │
│    mechanisms effectively broken                     │
│  ──────────────────────────────────────────────────  │
│  Score    ████████████░░░░░░░░░░░░░  46.9            │
│  ─────    ·    ·    ·    ·    ·                      │
│           Crit  Dev  Func Est  Ex                    │
│                                                      │
│  Dimensions (8)                                      │
│  AWR ██░  EMP █░░  ACT ░░░  EQU ██░                  │
│  BND ███  ACC ░░░  SYS ██░  INT ░░░                  │
└──────────────────────────────────────────────────────┘
```

**Wire frame — standard card (no dimension strip):**

```
┌──────────────────────────────────────────────────────┐
│                                              Applied  │
│  Anthropic                           AI Labs          │
│                                                      │
│  90.9  →  68.8                       ↓ 22.1 pts      │
│  Exemplary → Established                             │
│                                         High conf.   │
│  ──────────────────────────────────────────────────  │
│  ▌ Head of Safeguards Research resigned, citing      │
│    commercial pressures overriding safety values     │
│  ▌ Core pause commitment removed under Pentagon      │
│    deadline pressure                                 │
│  ──────────────────────────────────────────────────  │
│  Score  ██████████████░░░░░░  68.8                   │
└──────────────────────────────────────────────────────┘
```

**Visual specification — card container:**

- Outer `<table>`: `border-collapse:separate`, `border-radius:12px`, `border:1px solid [direction-color at 30% opacity]`
- Inner `<td>`: `background-color:#111827`, `border-radius:12px`, `padding:20px`
- Bottom margin between cards: 16px

**Visual specification — card header zone:**

- Status badge (top-right): "Applied" or "Proposed" — 10px, 600 weight, `background-color: rgba(134,239,172,0.10)`, `border: 1px solid rgba(134,239,172,0.25)`, `border-radius:10px`, `padding:2px 8px`, `color:#86efac`. "Proposed" variant: `color:#fcd34d`, yellow tones.
- Entity name: 15px, 700 weight, #e8eefb, positioned left
- Index label: 11px, 500 weight, #8fa3be, below entity name

**Visual specification — score row:**

- Old score: 13px, 400 weight, #5a6a7e, monospace. Reads as "prior state" — visually recessive.
- Arrow: "→" in #5a6a7e, 12px. HTML entity `&rarr;`
- New score: 20px, 700 weight, band color, monospace. This is the dominant visual element — it should be the first number a scanner's eye lands on.
- Delta: right-aligned. Arrow (↓ or ↑) + value. 13px, 600 weight, direction color, monospace.
- Layout: old score + arrow + new score left-aligned. Delta right-aligned. Two-column `<table>` with right cell `align="right"` and `white-space:nowrap`.

**Visual specification — band change row:**

- If band changed: dot (8px circle, old band color) + old band label + arrow + dot (new band color) + new band label + separator + confidence
- If no band change: dot (current band color) + band label + separator + confidence
- All 12px, colors as specified. Confidence in #8fa3be.
- Top margin: 8px. Bottom margin: 12px.

**Visual specification — evidence bullets:**

- Left border: 2px solid, direction color at 35% opacity
- Padding-left: 12px
- Each bullet: `<span style="display:block; margin-bottom:8px;">` (last bullet: no margin-bottom)
- Font: 13px, 400 weight, #8fa3be (NOTE: V2 upgrades evidence text from #8fa3be to #b8c6de — secondary rather than muted — for better readability. See accessibility section.)
- No bullet character — the left border IS the visual indicator
- Max length per bullet: 120 characters. If generator evidence is longer, truncate at last complete clause before 120 chars, add no ellipsis.

**Visual specification — score bar (redesigned):**

V1 uses 10-block Unicode bars with no band threshold information. V2 replaces this with an HTML/CSS percentage-width bar that encodes band boundaries.

The bar is built from a table with 5 cells, each representing 20 points (one band):

```
[BAND 1: 0–20][BAND 2: 20–40][BAND 3: 40–60][BAND 4: 60–80][BAND 5: 80–100]
```

Each cell has a background color. The filled portion of the bar uses the entity's current band color. The bar width is proportional to the score.

Implementation approach (email-safe, no CSS gradients):

Use a fixed-height `<td>` with `background-color` set to the band color for the filled portion, and container background for the unfilled portion. The "filled" table cell width is `[score]%` of the 520px available inner width (600px minus 2×20px padding minus 2×20px card padding). Round to nearest whole pixel.

The band threshold markers (at 20, 40, 60, 80) are represented as 1px-wide cells with a slightly lighter background. In practice, a simplified version may be cleaner:

**Simplified score bar (recommended):**

```
[████████████████░░░░░░░░░░░░░░░░░]  46.9
 ·         ·         ·         ·
Crit      Dev       Func      Est    Ex
```

Specification:
- Bar height: 6px (achievable as a `<td>` with `height:6px; font-size:1px; line-height:1px`)
- Bar is a 3-cell table: filled portion, empty portion (each sized by score %), and nothing else
- Filled cell: `background-color:[band-color]`, `height:6px`
- Empty cell: `background-color:#2a3444` (a dark blue-grey), `height:6px`
- Threshold dots: Below the bar, a row of 4 dots at 20%, 40%, 60%, 80% positions, in #2a3444. These are 4px × 4px cells.
- Score label: 12px, 400 weight, #5a6a7e monospace, to the right of the bar
- Top margin: 12px

**NOTE**: The percentage-width bar has a known Outlook limitation. Outlook 2013/2016 ignores percentage widths on inner table cells. Workaround: use fixed pixel widths calculated from the score. For a 520px bar: filled pixel width = `Math.round(score / 100 * 520)`, empty pixel width = `520 - filled`. The generator must calculate these values.

**Visual specification — dimension profile strip (top 1–2 cards only, NEW):**

For the entity with the largest delta, and optionally the second-largest, include an 8-dimension profile strip below the score bar.

Layout: 2 rows × 4 columns. Each cell shows: dimension abbreviation (3 chars) + small bar (3 blocks) + score.

The 8 dimensions with their abbreviations:
- AWR — Awareness
- EMP — Empathy
- ACT — Active Response
- EQU — Equity
- BND — Boundaries
- ACC — Accountability
- SYS — Systems Thinking
- INT — Integrity

Each dimension is scored 0–100. The mini-bar uses 3 Unicode blocks:
- 0–33: ░░░ (empty)
- 34–66: █░░ (one filled)
- 67–84: ██░ (two filled)
- 85–100: ███ (three filled)

The blocks are colored by the dimension's own band color (not the composite score's band color). This is important — a dimension can be Critical while the composite is Functional.

```
Dimensions
AWR ██░  EMP █░░  ACT ░░░  EQU ██░
BND ███  ACC ░░░  SYS ██░  INT ░░░
```

Specification:
- Section label: "Dimensions" — 10px, 700 weight, #5a6a7e, uppercase, 8px top margin
- 2-row, 4-column table. Each cell: `width:25%`
- Dimension label: 10px, 700 weight, #5a6a7e, monospace
- Bar blocks: 11px monospace, colored by dimension band
- Scores are NOT shown in the mini-strip — the bar encoding is sufficient. Adding 8 more numbers creates noise.

**OPEN QUESTION**: The dimension scores are not currently in the weekly JSON data — the JSON only carries composite scores. If the dimension profile strip is required, the generator must pull dimension scores from entity assessment files or a separate data source. This needs product-owner confirmation before implementation.

**Card edge cases:**

- Upgrade (positive delta): Border color = rgba(134,239,172,0.30). Evidence border = rgba(134,239,172,0.35). New score in #86efac. Delta shows ↑ in #86efac.
- No band change: Show only current band label (no arrow). Omit old band.
- Confidence "low": add "(low confidence)" in #fb923c italic after the confidence indicator
- Very long entity name (>25 chars): Allow wrap, maintain left/right two-column layout. "Demokratische Volksrepublik Korea" is 33 chars — it wraps to 2 lines. This is acceptable.
- Score of 0.0: Show "0.0" not "0" — preserve decimal precision throughout

**How many detail cards to show:**

V2 recommendation: **Top 5 by |delta|**, same as V1. The compressed table above handles the need for showing all changes. If there are fewer than 3 changes total, show all as detail cards (no compressed table needed — see edge cases for compressed table above).

---

### 7.6 Band Change Badge / Pill

This component appears in both the detail card and the compressed table.

**In detail cards**: The band change row is a full-width row within the card. Described in 7.5.

**In the compressed table**: The band change indicator is a single column. Use the Unicode double-arrow "↕" character (#7dd3fc color) when a band change occurred. Empty cell when no band change. Screen-reader text: add a visually-hidden span for "band changed" / "no band change" using the `font-size:0` technique or `mso-hide:all` — but this is not strictly necessary since the column header says "Band ↕".

**Standalone pill variant (for future use)**: If a standalone badge is needed (e.g., in an alert or a header annotation):
- `background-color: rgba([band-color], 0.10)`
- `border: 1px solid rgba([band-color], 0.25)`
- `border-radius: 10px`
- `padding: 2px 8px`
- Font: 10px, 600 weight, band color
- Text: "[Old band] → [New band]" e.g., "Established → Functional"

---

### 7.7 Confirmations Block (Redesigned)

**V1 problem**: Flat list, alphabetical, with index in parentheses. With 16 confirmations, this becomes visually uniform and hard to scan for a specific entity or index.

**V2 approach**: Group by index. Within each index group, sort by |delta| descending. Show index name as a sub-header. Use a tight table format.

**Wire frame:**

```
SCORES CONFIRMED  ────────────────────────────────────

  AI Labs
  xAI/Grok*          18.3 → 21.3    +3.0
  OpenAI             40.6 → 38.9    −1.7

  Countries
  Iceland            89.1 → 87.5    −1.6
  Sweden             87.5 → 84.4    −3.1
  Switzerland        84.4 → 84.4     0.0
  Ukraine            50.0 → 46.9    −3.1
  Venezuela           4.4 →  7.8    +3.4
  DRC                 5.9 →  5.5    −0.4
  Iran                2.8 →  1.6    −1.2
  Haiti               3.1 →  3.1     0.0
  Myanmar             0.0 →  0.0     0.0
  Sudan               0.0 →  0.0     0.0

  Fortune 500
  Boeing              9.1 →  5.0    −4.1
  Chevron             9.1 →  8.6    −0.5
  Cigna Group        15.3 → 18.8    +3.5
  Exxon Mobil         9.1 →  7.8    −1.3
  Meta Platforms     12.2 →  9.4    −2.8

  16 total · View all at compassionbenchmark.com/updates →
```

**Visual specification:**

- Section label: "SCORES CONFIRMED" — 10px, 700 weight, #7dd3fc, uppercase, letter-spacing 0.10em
- Index sub-header: 11px, 700 weight, #5a6a7e, uppercase, letter-spacing 0.06em. Padding: 12px top (except first group), 4px bottom.
- Data row table: 3 columns — Entity (left, 60% width), Score range (center, 25% width), Delta (right, 15% width)
- Entity: 13px, 600 weight, #e8eefb
- Score range: 13px, 400 weight, #5a6a7e monospace. "old → new"
- Delta: 13px, 600 weight, direction color, monospace. "+3.0" or "−1.7" or "0.0"
- Delta 0.0: color #5a6a7e (dim) — not a change
- Row height: 28px. Row padding: 4px top/bottom
- No divider lines between rows — the compact format is self-sufficient
- Divider line between index groups: 1px solid rgba(255,255,255,0.04), 4px margin top/bottom

**Mobile (≤480px)**: Collapse score range column (`mobile-hide`). Show Entity + Delta only.

**Content rules:**
- Max 16 confirmations shown. If more than 16: show 16, then "... and N more confirmed. View all →"
- Sort within each index group: by |delta| descending, then alphabetical for ties
- An entity that was proposed for a score change this week should NOT appear in confirmations (they are separate lists)
- If zero confirmations: omit section entirely (do not show empty section)

**Edge case**: An entity might appear in both score changes and confirmations if the pipeline processed it twice (different assessment runs in the same week). In this case, show it in score changes only and omit from confirmations.

---

### 7.8 Finding Block (Typography Push)

**V1**: Numbered 01/02/03, body in #b8c6de at 14px/1.6. Works but lacks visual pull. The numbered label is understated.

**V2 proposal**: Same structure, but push the number harder and increase the body text. The findings section is the editorial core of the publication — it should feel weightier than the data cards.

**Wire frame:**

```
FINDINGS  ──────────────────────────────────────────────

  01  All four assessed AI labs received downgrade
      proposals this week. Combined delta: −88 points
      across Mistral, Anthropic, OpenAI, and xAI.
      Published scores were calibrated on safety
      commitments the evidence has since dismantled.

  02  Accountability is the most consistently damaged
      dimension across every sector assessed. Boeing,
      xAI, J&J, Israel, UnitedHealth — harm was
      acknowledged only under legal compulsion.

  03  Entities with strong institutional self-reporting
      consistently overstate their compassion profiles
      relative to primary-source evidence.
```

**Visual specification:**

- Section label: "FINDINGS" — 10px, 700 weight, #7dd3fc, uppercase, 0.10em letter-spacing
- Layout: 2-column table per finding. Left cell: number. Right cell: body.
- Number cell: width 32px, vertical-align top
- Number: 13px, 700 weight, #7dd3fc, monospace. "01" "02" "03". Top padding: 2px (aligns baseline with body first line)
- Body: 14px, 400 weight, #b8c6de, line-height 1.65. This is slightly larger line-height than V1 (1.6) — gives the finding more breathing room.
- Between findings: 16px bottom padding on each finding row
- Last finding: no bottom padding (section divider provides space)

**Pull-quote option (for single standout finding)**: If one finding in the week is exceptionally significant, the generator can flag it for "pull-quote" treatment. In that case, the finding body is shown at 15px weight 500, with a 3px left border in #7dd3fc and padding-left 16px. This is NOT applied programmatically to every finding — only when the generator flags it. Default: no pull-quote treatment.

**Content rules (from existing NEWSLETTER_TEMPLATE.md, reinforced):**
- Max 3 findings per issue
- At least 1 must be cross-entity (not about a single entity)
- No repetition of score-card evidence — findings interpret
- Max 3 sentences per finding
- Max 200 characters per finding (not sentence — total finding)
- No hedging language outside of Signals section

---

### 7.9 Signal Block (With Type Differentiation)

**V1**: All signals use a single "Risk" label in #fb923c. V2 differentiates by signal type.

**Signal types and colors:**

| Type | Label | Color | Usage |
|---|---|---|---|
| Regulatory | REGULATORY | #fb923c | Enforcement dates, compliance deadlines |
| Litigation | LITIGATION | #f87171 | Active lawsuits, legal proceedings, investigations |
| Financial | FINANCIAL | #fcd34d | Market exposure, economic impacts |
| Governance | GOVERNANCE | #7dd3fc | Leadership, accountability failures, board issues |

The generator must classify each signal into one of these four types. If a signal spans multiple types, use the type that represents the primary risk to the reader. Default fallback: REGULATORY.

**Wire frame:**

```
SIGNALS  ───────────────────────────────────────────────

  ┌─ REGULATORY ────────────────────────────────────┐
  │ EU AI Act high-risk enforcement begins Aug 2,   │
  │ 2026 (109 days). All four AI labs assessed this  │
  │ week face direct exposure.                       │
  └──────────────────────────────────────────────────┘

  ┌─ LITIGATION ────────────────────────────────────┐
  │ Federal Take It Down Act enforceable May 2026   │
  │ (15 days). xAI/Grok's CSAM deepfake scandal     │
  │ creates highest-exposure target for first        │
  │ enforcement actions.                             │
  └──────────────────────────────────────────────────┘

  ┌─ LITIGATION ────────────────────────────────────┐
  │ Exxon v. Boulder (SCOTUS, Fall 2026). If the    │
  │ Court enables state climate liability, Exxon     │
  │ (9.1) and Chevron (9.1) face wave litigation.   │
  └──────────────────────────────────────────────────┘
```

**Visual specification:**

- Section label: "SIGNALS" — 10px, 700 weight, #7dd3fc, uppercase
- Each signal: outer `<table>` with `border-left:3px solid [signal-color]` and `background-color:rgba([signal-color-rgb],0.04)`. Padding: 12px 16px.
- Type label: 10px, 700 weight, [signal-color], uppercase, letter-spacing 0.06em. Display as first line within the signal cell, margin-bottom 6px.
- Body: 13px, 400 weight, #b8c6de, line-height 1.55
- Timeline element (if present): Bold the date/timeframe inline within the body sentence — do NOT use a separate element. "Aug 2, 2026 (109 days)" — "109 days" in weight 600 of the same color as the body.
- Margin between signals: 12px
- Last signal margin-bottom: 24px

**Mobile**: No changes needed — single-column layout already works.

**Content rules:**
- Max 3 signals per issue
- Each signal must name a specific date, timeline, or regulatory event
- Body max 150 characters
- Signals are forward-looking — must use future tense or present + timeline
- Do NOT use "could", "might", or "may" excessively. If it is a regulatory enforcement date, it IS happening. Hedge only where truly uncertain.

---

### 7.10 Data Viz: Score Bar (Full Specification)

This is a standalone specification since the score bar is complex and appears in multiple contexts.

**Context 1: Within a detail card** (height 6px, full card width minus padding)

The bar represents the entity's new (proposed/applied) score on a 0–100 scale.

Construction (email-safe, Outlook-compatible):

```
[outer table: width=100%, cellpadding=0, cellspacing=0]
  [tr]
    [td: width=[filled_px]px, height=6px, bgcolor=[band_color], font-size=1px, line-height=1px]&nbsp;[/td]
    [td: width=[empty_px]px, height=6px, bgcolor=#2a3444, font-size=1px, line-height=1px]&nbsp;[/td]
    [td: width=48px, valign=middle, padding-left=8px]
      [score label: 12px, #5a6a7e, monospace]
    [/td]
  [/tr]
[/outer table]
```

Where:
- Inner bar width = 480px (600px - 28px×2 padding - 20px×2 card padding - 12px×2 rounding margin - 8px score label gap - 48px label width = approximately 464px usable. Use 460px for safe calculation.)
- filled_px = Math.round(score / 100 * 460)
- empty_px = 460 - filled_px
- band_color = the band color for the entity's NEW score (not old)

**Band threshold markers**: A second row below the bar, 4px high, showing tick marks at 20/40/60/80:

```
[tr]
  [td: width=[20%_px]px][pixel spacer][/td]  <- first 20 points
  [td: width=2px, bgcolor=#3a4a5e][/td]       <- tick at 20
  [td: width=[20%_px - 2]px][/td]             <- next 20 points
  [td: width=2px, bgcolor=#3a4a5e][/td]       <- tick at 40
  [td: ...] [/td][td: ...][/td][td: ...][/td] <- etc.
  [td: width=48px][/td]                       <- label column spacer
[/tr]
```

This approach is robust in Outlook because all widths are fixed pixels.

Below the tick row, add band labels in tiny text (optional — only if vertical space allows):

```
[tr]
  [td style="font-size:9px; color:#3a4a5e; font-family:monospace; letter-spacing:0.04em; padding-top:2px;" colspan=9]
    Crit · Dev · Func · Est · Ex
  [/td]
[/tr]
```

Note: The band labels below the bar are a stretch goal. If they cause layout issues in testing, remove them. The threshold tick marks are more important than the labels.

**Context 2: In the dimension profile strip** (3-block Unicode bar)

See section 7.5 (dimension profile strip). Uses ░ (U+2591) for empty and █ (U+2588, full block) for filled. Colored via `<span>` with dimension's band color.

---

### 7.11 CTA 1 — Research Upsell (Refined)

**Placement**: Immediately after the last detail card, before the confirmations section divider.

**V1 problem**: The CTA is styled as a parenthetical observation in italic text. It reads as a footnote. V2 makes it feel like a natural continuation of the editorial voice — an institutional reference, not a pitch.

**V2 copy:**

> "Dimension-level scores, evidence citations, and methodology notes for all assessed entities are available at [compassionbenchmark.com/purchase-research](link)."

The difference from V1: V1 says "Full reports for assessed entities." V2 says what specifically is in those reports. This is more useful to an ESG analyst who is deciding whether to click.

**Visual specification:**

- No background, no border, no box — plain text only
- Font: 13px, 400 weight, #5a6a7e (dim), line-height 1.6
- NOT italic — italic reads as secondary, cautious. This reference should be stated plainly.
- Link: #7dd3fc, no underline
- Top margin: 20px (after last card). Bottom margin: 24px (before divider).

---

### 7.12 CTA 2 — Institutional Services (Refined)

**Placement**: After the signals section, before the footer divider. (In V1 this is after the stats bar — V2 moves the stats bar to the footer, so CTA 2 comes later.)

**V1 problem**: The box is slightly too salesy. "Reply to this email" is good. The framing of the offer is generic.

**V2 copy:**

> "Producing an ESG brief, divestment analysis, or policy position that intersects with these rankings? We provide licensed dataset access, structured briefings, and expert review for institutional use. Reply to this email."

The change: "Working on" becomes "Producing" — more active. "ESG report" is specific but too broad. "Divestment analysis" and "policy position" are specific use cases that signal to the right audience that we understand their workflow.

**Visual specification:**

- Box: `background-color:rgba(125,211,252,0.04)`, `border:1px solid rgba(125,211,252,0.10)`, `border-radius:12px`, `border-collapse:separate`
- Padding: 20px
- Font: 13px, 400 weight, #8fa3be, line-height 1.6, text-align center
- "Reply to this email." — 13px, 600 weight, #7dd3fc (elevated from 500 to 600 for emphasis)
- No button. No link. The "reply" is the action.

---

### 7.13 Footer (Restructured)

**V2 footer order:**

```
[DIVIDER — rgba(125,211,252,0.12), 1px]

[Pipeline stats row]
  Assessed: 29 · Changes: 13 · Band changes: 7 · Confirmed: 16 · Tracked: 1,155

[THIN DIVIDER — rgba(255,255,255,0.06)]

[Independence statement]
  Scores reflect the 8-dimension, 40-subdimension [Compassion Framework →].
  Entities never pay for inclusion, score changes, or suppression of findings.

[THIN DIVIDER]

[Nav links]
  Daily findings · All indexes · Methodology · Purchase research

[THIN DIVIDER]

[Legal / unsubscribe]
  You received this because you subscribed at compassionbenchmark.com.
  [Unsubscribe] · [View in browser]
```

**Why pipeline stats move to footer**: They are operational metadata — useful for researchers and institutional subscribers as a "this is how the machine ran this week" signal, but not editorial content. Moving them here reduces the cognitive load at the top of the email and makes the footer more informative (it's no longer just legal boilerplate).

**Visual specification — pipeline stats:**

- Font: 12px, 400 weight, #5a6a7e, text-align center
- Values: 12px, 600 weight, #8fa3be (slightly elevated from the labels)
- Separators: `&nbsp;&middot;&nbsp;`
- Top margin from divider: 20px. Bottom margin to next divider: 16px.

**Visual specification — independence statement:**

- Font: 12px, 400 weight, #8fa3be, line-height 1.6
- "Compassion Framework" is a link to /methodology — #7dd3fc, no underline

**Visual specification — nav links:**

- Font: 12px, 400 weight, #7dd3fc, line-height 2.0
- Separators: `&nbsp;&middot;&nbsp;` in #5a6a7e

**Visual specification — legal:**

- Font: 11px, 400 weight, #5a6a7e, line-height 1.6
- "Unsubscribe" and "View in browser" links: #5a6a7e, underline (standard convention for unsubscribe)

---

## 8. Visual Hierarchy Map

This validates the editorial goals of the redesign.

### First paint (~top 300px in email client at 14px zoom)

The reader sees:

1. **Masthead**: "COMPASSION BENCHMARK" wordmark + "Weekly Briefing" + date range + methodology link
2. **Lede**: The single most significant finding, in 17px/600. "Four AI labs fell a combined 88 points — the largest sector-wide collapse in the index."
3. **Summary ticker**: 5 numbers in a horizontal band. ASSESSED 29 / CHANGES 13 / BAND ↕ 7 / TOP MOVE −29.5 pts Mistral AI / CONFIRMED 16
4. First line of the "SCORE MOVEMENTS" section label

At this point the reader knows: (a) what happened, (b) the scale, (c) which entity had the largest move. That is enough information to decide whether to continue reading. This is the Economist Espresso test.

### 3-second scan

The reader's eye moves to:

5. **Compressed change table**: Scans all 13 entity names and deltas. Identifies any entities in their portfolio, coverage area, or research domain.

### 30-second scan

The reader:

6. **Reads 2–3 detail cards** — the entities that appeared in the compressed table as relevant
7. **Reads finding 01** (usually the most significant synthesis)
8. **Checks signal type labels** — scans for "REGULATORY" or "LITIGATION" relevant to their domain

### Full read (3+ minutes)

9. All 5 detail cards including evidence bullets
10. All 3 findings
11. All 3 signals in full
12. Confirmations table (by index group)
13. CTA 2 (institutional services)
14. Footer pipeline stats

---

## 9. Mobile Specification (≤480px)

All mobile overrides are applied via `@media only screen and (max-width: 480px)` in the `<style>` block in `<head>`. They are class-based — inline styles establish the desktop default, classes override for mobile.

### Mobile class definitions

```css
@media only screen and (max-width: 480px) {
  .email-container { width: 100% !important; max-width: 100% !important; }
  .mobile-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .mobile-stack { display: block !important; width: 100% !important; }
  .mobile-hide { display: none !important; }
  .mobile-text-lg { font-size: 16px !important; line-height: 1.5 !important; }
  .mobile-h1 { font-size: 22px !important; }
  .mobile-lede { font-size: 16px !important; }
  .mobile-score-new { font-size: 18px !important; }
  .mobile-center { text-align: center !important; }
  .mobile-full-width { width: 100% !important; }
  .score-row td { display: block !important; width: 100% !important; text-align: left !important; padding-bottom: 6px !important; }
  .ticker-cell { display: block !important; width: 50% !important; float: left !important; padding-bottom: 12px !important; }
  .confirm-col-score { display: none !important; } /* hide score range on mobile */
}
```

### Component-by-component mobile behavior

**Masthead**: Single row on mobile — wordmark left, date right. The methodology link row below hides on mobile (it's in the footer too). Add class `mobile-hide` to the methodology link row.

**Lede block**: Apply `mobile-lede` class. Reduces from 17px to 16px. Line-height stays 1.45.

**Summary ticker**: Apply `ticker-cell` to each stat cell. This creates a 2-column float layout on mobile (2 columns × 3 rows for 5 stats, with the last cell spanning full width or the 5th stat centered below). Note: CSS `float` is unreliable in some email clients. A safer alternative: use a 2-column table (100% width) where each column has 50% width, and put stats in pairs.

**Compressed change table**: Apply `mobile-hide` to the Score and Index columns. Only Entity and Delta remain visible. This keeps the table readable at narrow widths.

**Detail cards**: The two-column layout (entity left, score right) stacks to single column via `.score-row td { display:block }`. The new score (large) appears below the entity name. The delta appears below the new score. This is readable and correct.

**Score bar**: The bar width calculation must account for mobile. On mobile, available bar width = `device_width - 32px` (16px padding each side) - `20px×2` (card padding) - `48px` (score label). At 320px minimum device width: `320 - 32 - 40 - 48 = 200px`. The bar must be calculated for desktop (460px) and mobile (200px). Since inline styles carry the desktop calculation, mobile cannot recalculate the pixel bar dynamically. Solution: Use percentage widths for the bar cells on mobile, accepting that Outlook 2013 on mobile is rare enough not to require a fix. Apply class `mobile-full-width` to the outer bar table.

**Dimension profile strip**: Hide entirely on mobile via `mobile-hide`. The additional 8 data points are too dense for narrow screens.

**Confirmations table**: Hide the Score column (`confirm-col-score`). Show Entity and Delta only.

**CTA 2 box**: Full width on mobile, centered text. Already achieves this with the existing style.

**Touch targets**: All linked text must have minimum 44px tap target. For text-only links in body content, this is achieved by ensuring `line-height` is at least 44px on the link's parent `<td>`, or by adding `padding: 11px 0` to links to expand the tap zone. The unsubscribe and "view in browser" links are particularly important — add `padding: 8px 0; display: inline-block;` via class.

---

## 10. Accessibility Specification

### Color Contrast (WCAG 2.1)

All text must meet AA (4.5:1 for normal text, 3:1 for large text ≥18px regular or ≥14px bold).

| Text color | Background | Contrast ratio | Passes |
|---|---|---|---|
| #e8eefb on #0b1220 | Primary on container | 15.1:1 | AAA |
| #e8eefb on #111827 | Primary on card | 12.8:1 | AAA |
| #b8c6de on #0b1220 | Secondary on container | 9.2:1 | AAA |
| #b8c6de on #111827 | Secondary on card | 7.8:1 | AAA |
| #8fa3be on #0b1220 | Muted on container | 6.1:1 | AA |
| #8fa3be on #111827 | Muted on card | 5.2:1 | AA |
| #5a6a7e on #0b1220 | Dim on container | 3.5:1 | AA large only |
| #7dd3fc on #0b1220 | Accent on container | 8.9:1 | AAA |
| #7dd3fc on #111827 | Accent on card | 7.5:1 | AAA |
| #86efac on #111827 | Established band | 6.4:1 | AA |
| #fcd34d on #111827 | Functional band | 8.9:1 | AAA |
| #fb923c on #111827 | Developing band | 5.2:1 | AA |
| #f87171 on #111827 | Critical band | 4.8:1 | AA (barely) |

**Note on #5a6a7e (dim)**: This color at 3.5:1 passes only for "large text" (18px+ regular, or 14px+ bold). In V2, #5a6a7e is used only for: footer legal text (11px — does NOT pass AA for normal text), score arrows within cards (12px), and score labels within the bar (12px). These are all supporting elements where the meaning is conveyed by adjacent text. This is a known and accepted accessibility tradeoff. If strict AA compliance for all text is required, replace #5a6a7e with #6e7e93 (which achieves 4.5:1 on #111827).

### Semantic Structure

- All layout `<table>` elements: `role="presentation"` — prevents screen readers from announcing table structure
- All layout `<td>` elements: no `scope` attribute — presentation tables have no header/data cell semantics
- Color coding: every color-coded element must have a text equivalent nearby. The band dot (8px colored circle) must be accompanied by the band name as text. The delta arrow (↓/↑) must be accompanied by the numeric value and "pts" text. Never rely on color alone.
- Preheader: serves as a second summary for screen readers — keep it factually accurate and specific
- Score bar: include `aria-label="Score: 46.9 out of 100, Functional band"` on the containing `<td>` or a visually-hidden text span
- Evidence bullets: no need for semantic list markup (`<ul>`) in email — `<span style="display:block">` is sufficient and more compatible
- Links: all link text must be descriptive. "View all →" should be "View all score changes at compassionbenchmark.com →". "Reply to this email" does not need additional label.

### Screen Reader Hidden Text Pattern

For elements where meaning is conveyed visually but needs a text equivalent:

```html
<span style="font-size:0; line-height:0; color:transparent; mso-hide:all;" aria-hidden="false">
  [screen-reader text here]
</span>
```

Use this for: score bar aria-labels, delta direction context ("decreased by"), band dot descriptions.

### Focus Order

Not applicable in email (no interactive elements beyond links). All links must be in logical reading order (source order = reading order in single-column layout — this is guaranteed by the table-based layout).

### Alt Text

No images in V2 (same as V1 — text-only email). If a logo image is ever added, `alt="Compassion Benchmark"`. All decorative Unicode characters (dots, bars) are in `aria-hidden="true"` spans.

---

## 11. Content and Editorial Guidance for the Generator Script

The following content rules must be implemented or adjusted in `generate-newsletter.mjs`:

### Lede sentence (new requirement)

The generator must produce a lede sentence using the following priority order:

1. If any entity has |delta| ≥ 25: "[$ENTITY] fell/rose $DELTA points — the largest single-entity change since [period or 'in pipeline history' if no prior comparator]."
2. If band_changes ≥ 5: "$BAND_CHANGES entities crossed a band boundary this week — [above/at/below] the historical average of [avg]."
3. If a single sector has 3+ changes: "[$SECTOR] entities accounted for $N of $TOTAL score changes this week, falling a combined $COMBINED_DELTA points."
4. If downgrades = total changes and total > 5: "Every score change this week was a downgrade — $N entities across $SECTORS fell a combined $TOTAL_DELTA points."
5. Default quiet week: "$CONFIRMED confirmations and $CHANGES score changes this week. [The largest change: $ENTITY at $DELTA pts.]"

The lede sentence must not exceed 160 characters. It must not contain hedging language. It must use specific entity names, numbers, or sector names — never generic phrases.

### Preheader (existing, refined)

- 90 characters max, hard limit
- Must complement the lede (not repeat it)
- Must include at least one specific entity name or regulatory event
- Good: "xAI/Grok CSAM deepfake scandal adds to SEC probe. CVS opioid fraud case advances."
- Bad: "Six score changes and three band changes in this week's assessment cycle."

### Compressed change table data requirements

The generator must produce entries for ALL score changes, not just the top 5. Each entry needs:
- entity (name as published)
- index (abbreviated: AI Labs, F500, Countries, Robotics, US States, US Cities, Global Cities)
- publishedScore (1 decimal place)
- proposedScore (1 decimal place)
- delta (with sign, 1 decimal place)
- bandChange (boolean)

These are already in the weekly JSON — no new data source required.

### Dimension profile strip data requirements (conditional)

If the product-owner confirms the dimension strip should be included in the top card:

- The generator must look up the dimension scores from the entity's assessment file at `research/assessments/[slug].md` or a to-be-created structured data source
- Assessment files are Markdown — the generator would need to parse dimension scores from the Markdown
- Alternative: add dimension scores to the weekly JSON at generation time (cleaner, recommended)
- Until this is resolved, the dimension strip should be omitted from the generator and left as a manual-only feature for special issues

### Evidence bullet character limits

- Max 120 characters per bullet (enforced by generator truncation)
- Generator should check: if `evidence[0].length > 120`, truncate at last word boundary before 120, append nothing (no ellipsis)
- Evidence bullets must start with the source (who found it), not the finding itself. Bad: "68% adversarial success rate." Good: "Enkrypt AI found 68% adversarial success rate."

### Signal type classification (new requirement)

The generator must classify each signal into one of four types: REGULATORY, LITIGATION, FINANCIAL, GOVERNANCE. Classification logic:

- Contains a regulatory agency name (EU, FTC, DOJ, NLRB, FDA, SEC, OSHA, etc.) or enforcement date → REGULATORY
- Contains lawsuit, suit, case, verdict, settlement, court, trial, plaintiff, defendant → LITIGATION
- Contains market cap, revenue, stock, earnings, M&A, bankruptcy, debt, credit → FINANCIAL
- Contains CEO, board, chairman, executive, resignation, leadership, governance, accountability → GOVERNANCE

If multiple match, use first match in this priority order: LITIGATION > REGULATORY > FINANCIAL > GOVERNANCE.

### Finding body character limits

- Max 200 characters per finding (enforced)
- Max 3 sentences per finding
- Each finding must contain at least 2 named entities or 1 named entity + 1 quantified claim (number, percentage, or score)

### Confirmations grouping (new requirement)

The generator must group confirmations by index and sort within groups by |delta| descending. The output object should be:

```json
{
  "confirmationsByIndex": {
    "Countries": [...],
    "Fortune 500": [...],
    "AI Labs": [...],
    "Robotics": [...]
  }
}
```

Currently the weekly JSON has a flat `confirmations` array. This grouping can be done in the generator at render time — no JSON schema change strictly required.

---

## 12. Implementation Notes for the Frontend Engineer

### General HTML Email Rules

1. All layout tables: `role="presentation" cellpadding="0" cellspacing="0" border="0"`
2. Never use `margin` on `<td>` — use `padding` instead. Outlook ignores `margin` on table cells.
3. Never use `display:flex` or `display:grid` — not supported in any email client.
4. Never use CSS variables at runtime — no `var(--color)` in inline styles.
5. Never use `background-image` for content — too many clients block images by default.
6. `border-radius` on a `<td>` requires `border-collapse:separate` on the containing `<table>`. This is already used in V1 for cards — maintain the pattern.
7. Use `font-size:0; line-height:0` on spacer cells — prevents Outlook from adding phantom space.

### Outlook-Specific

8. All `width` attributes on `<table>` and `<td>` elements should be set as HTML attributes (`width="600"`) not just CSS (`style="width:600px"`). Outlook respects both but the attribute is more reliable.
9. For the score bar: Outlook 2013/2016 does not support percentage widths on `<td>` inside a fixed-width table. Use calculated pixel widths for both the filled and empty cells. The generator must calculate these per entity per render.
10. For `border-radius` on cards: Outlook 2013 does not support `border-radius`. The card will render as a rectangle with a border — acceptable fallback. Do NOT use VML-rounded-corners for this — the complexity is not worth it for this design.
11. Conditional comments for Outlook width fix on the email container:
    ```html
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center">
    <tr><td>
    <![endif]-->
    [email container here]
    <!--[if mso]></td></tr></table><![endif]-->
    ```
12. The `mso-table-lspace: 0pt; mso-table-rspace: 0pt` reset on `table, td` is essential — prevents phantom spacing in Outlook.

### Dark Mode in Gmail

13. Gmail Android forced dark mode: Gmail will NOT invert colors if `<meta name="color-scheme" content="dark">` is set and `color-scheme: dark` is declared in `:root`. The V1 template already does this. V2 must maintain.
14. `!important` in media queries is required for the light-mode overrides to work in Apple Mail dark mode. Use class-based overrides with `!important`.

### The `<style>` Block Strategy

15. The `<style>` block in `<head>` is stripped by Gmail web client. This means:
    - All structural layout CSS must be inline
    - The `<style>` block handles ONLY: media queries (mobile), dark mode overrides, Outlook resets, and Gmail-specific hacks
    - Never put font-size, color, padding, or layout properties in the `<style>` block alone — always duplicate them as inline styles
16. Exception: mobile `.mobile-hide`, `.mobile-stack`, `.score-row td`, `.ticker-cell` classes can only live in the `<style>` block — this is intentional and correct. Clients that strip the `<style>` block (Gmail web) will show the desktop layout, which is acceptable.

### Score Bar Pixel Calculation (Generator Requirement)

17. The generator must compute and inject pixel widths for every score bar instance:

```javascript
const BAR_TOTAL_PX = 460; // available bar width in pixels
function scoreBarWidths(score) {
  const filled = Math.round((score / 100) * BAR_TOTAL_PX);
  const empty = BAR_TOTAL_PX - filled;
  return { filled, empty };
}
```

18. The label column (score number text) is 48px wide, allocated from the card's inner width. The outer card inner width is 560px (600px - 2×20px padding). Minus 48px label = 512px. Minus 52px for safe margins = 460px. This matches the constant above.

### Spacing Technique

19. Use empty `<tr>` rows with `<td style="font-size:[N]px; line-height:[N]px;">&nbsp;</td>` for vertical spacers. This is more reliable than `margin-top` or `padding-top` on containing elements, especially in Outlook.

### Monospace Font Rendering

20. The monospace font stack `'SF Mono', 'Fira Code', Consolas, 'Courier New', monospace` renders slightly larger than sans-serif at the same `font-size`. When switching between a score value (monospace) and adjacent text (sans-serif), visual alignment may be slightly off. Test specifically with the score row (old score → new score · delta) in Outlook, Gmail, and Apple Mail.

### Link Tracking

21. All links must use Listmonk's `{{ TrackLink "..." }}` directive. Never hard-code URLs directly in the content template. The `listmonk-campaign.html` base template already handles this correctly for footer links — apply the same pattern to all body content links.

### Bulletproof Button (if added in future)

22. V2 does not use buttons. If buttons are added in future, use the bulletproof nested table pattern:
    ```html
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#7dd3fc" style="border-radius:6px; padding:12px 24px;">
          <a href="..." style="color:#0b1220; font-weight:700; text-decoration:none; font-size:14px;">CTA text</a>
        </td>
      </tr>
    </table>
    ```
    VML wrapper needed for Outlook rounded corners if radius is required.

### Testing Checklist

The frontend engineer should test each of the following before marking implementation complete:

- [ ] Gmail web (Chrome) — dark theme
- [ ] Gmail web (Chrome) — light theme (force light in Gmail settings)
- [ ] Gmail Android — dark mode (forced dark mode behavior)
- [ ] Apple Mail macOS — dark mode
- [ ] Apple Mail macOS — light mode
- [ ] Apple Mail iOS — dark mode
- [ ] Outlook 2016 Windows (via Litmus or equivalent)
- [ ] Outlook 365 Windows
- [ ] 600px desktop width — all sections
- [ ] 375px mobile (iPhone SE size) — all sections
- [ ] Score bar pixel width — verify at score 0.0, 10.0, 50.0, 99.9, 100.0
- [ ] Compressed change table — 13-row version (this week's data)
- [ ] Confirmations — 16-entity version (this week's data), grouped by index
- [ ] Light mode override — all key colors confirmed overridden
- [ ] Screen reader test: tab through all links in logical order

---

## 13. Open Decisions Requiring Product-Owner Input

The following design decisions could not be resolved without product-owner input. They should be resolved before the frontend engineer begins implementation.

### Decision 1: Edition / Issue Number

Should the masthead include an edition or issue number (e.g., "Issue #14" or "Vol. 1, No. 14")?

- **For**: Adds significant institutional authority. Every major institutional publication tracks volume/issue. Signals ongoing research program, not ad-hoc content.
- **Against**: Requires a counter in the generator (minor engineering lift). If issues are ever skipped or irregular, counter accuracy becomes a concern.
- **Recommendation**: Add it. Use a simple sequential counter stored in a JSON config file alongside the generator. Start at Issue #1 retroactively from the first published issue.

### Decision 2: Dimension Profile Strip

Should the detail card for the top 1–2 score changes include an 8-dimension mini-profile strip showing AWR/EMP/ACT/EQU/BND/ACC/SYS/INT scores?

- **For**: This is the most meaningful addition for ESG analysts. It shows the shape of an entity's score, not just the composite. It is what peers like Sustainalytics and MSCI ESG show in their reports.
- **Against**: Requires dimension-level scores to be added to the weekly JSON or pulled from assessment files at generation time. Assessment files are Markdown — structured extraction would be needed.
- **Recommendation**: Add it, but as a Phase 2 feature. V2 implementation launches without it. Generator is updated to produce dimension scores in the weekly JSON as a separate task. Dimension strip is added in V2.1.

### Decision 3: Compressed Change Table — Default On/Off

Should the compressed change table be shown in every issue, or only when there are 6+ changes?

- **For always-on**: Power readers benefit from the full list even when there are only 3 changes.
- **For conditional (6+)**: With fewer than 6 changes, the compressed table is redundant with the detail cards directly below it.
- **Recommendation**: Show only when there are 4 or more changes. With 1–3 changes, go directly to detail cards. With 4+ changes, show compressed table first.

### Decision 4: Signal Type Classification — Manual vs. Automated

Should signal types (REGULATORY / LITIGATION / FINANCIAL / GOVERNANCE) be classified by the generator automatically (using keyword matching) or assigned manually by the human editor at generation time?

- **For automated**: Reduces manual work. The keyword logic in Section 11 is sufficient for most signals.
- **For manual**: Classification errors in automated systems (e.g., a DOJ investigation labeled REGULATORY instead of LITIGATION) undermine credibility with lawyers and compliance professionals.
- **Recommendation**: Automated with a manual override field in the signal data structure. The generator proposes a type; the editor can override.

### Decision 5: Lede Sentence — Automated vs. Editorial

The lede sentence generation logic in Section 11 is rule-based. Should it be fully automated, or should the editor be able to write a custom lede each week?

- **For automated**: Consistent voice, no extra editorial work.
- **For editorial**: The lede is the highest-visibility sentence in the email. It appears in clients that render the first 300px. A human-written lede will almost always outperform a template-derived one.
- **Recommendation**: Generate a default lede automatically. Add an optional `overrideLede` field in the weekly newsletter data file (similar to the existing editor's note override). If present, use it. If absent, use the generated lede.

---

## 14. References

The following design patterns were drawn from studying the listed publications. No screenshots are included because this is a text-only spec document.

| Pattern | Source |
|---|---|
| Lede strategy — declarative single fact | The Economist Espresso (economist.com/espresso) |
| Section eyebrow labels (uppercase, tracked) | FT Moral Money, Bloomberg Evening Briefing |
| Numbered findings with fixed-width number column | Exponential View by Azeem Azhar (exponentialview.co) |
| Signal type differentiation (regulatory vs litigation) | FT Alphaville risk flagging conventions |
| Compressed data table above detailed cards | Bloomberg Brief layout pattern |
| System monospace for measured values | Bloomberg Terminal UI conventions |
| Independence statement near header | FT Moral Money editorial independence note |
| Text-only institutional CTAs (reply CTA, no button) | The Information, Stratechery |
| 3-tier reading hierarchy (scan / skim / read) | Axios Smart Brevity methodology |
| Band threshold markers on score bars | Our World in Data chart design (ourworldindata.org) |
| Semantic color discipline (no decorative use) | FT Moral Money, Responsible Investor |
| Light-mode fallback via prefers-color-scheme | Litmus dark mode email guide (litmus.com/dark-mode) |
| Bulletproof score bars using table cell width | Campaign Monitor's email coding guide |
| Mobile stack via display:block override | Litmus responsive email patterns |
| Dimension profile strip concept | MSCI ESG Ratings methodology card, Sustainalytics |
| Volume / issue number for authority signaling | The Economist, FT Weekend, Bloomberg Businessweek |
| Score card lede + evidence hierarchy | Platformer (platformer.news) source-citation pattern |
| Pull-quote treatment for standout findings | Benedict Evans weekly newsletter |

---

*End of Compassion Benchmark Newsletter Design Specification V2.0*  
*Document length: ~3,000 lines. Implementation ready pending product-owner decisions in Section 13.*
