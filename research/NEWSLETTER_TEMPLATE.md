# Weekly Newsletter Template — Compassion Benchmark

> Finalized specification synthesizing product strategy, UX design, growth, and analytics inputs.
> This document defines the structure, content rules, visual format, CTAs, and measurement plan for the weekly email newsletter.

---

## 1. Overview

| Attribute | Value |
|-----------|-------|
| **Name** | Compassion Benchmark — Weekly Briefing |
| **Frequency** | Weekly, Tuesday 7:00 AM Eastern |
| **Generation** | Monday night (captures Mon–Sun pipeline data) |
| **Format** | HTML email (table-based) + plain-text fallback |
| **Max width** | 600px |
| **Theme** | Dark (#0b1220 background, #e8eefb text) |
| **Target reading time** | 3–5 minutes |
| **Send tool** | TBD (Buttondown, Substack, or self-hosted) |

---

## 2. Audience Personas

| Persona | What they want | Primary section |
|---------|---------------|-----------------|
| **ESG analyst / investor** | Score movements affecting portfolio or coverage | Score Changes, Sector Signal |
| **Governance / compliance team** | Peer entity status, band changes, regulatory risks | Score Changes, Emerging Risks |
| **Policy researcher / academic** | Cross-entity patterns, methodology rigor | Findings, Assessment Progress |
| **Journalist** | Leads: specific entities with dramatic movement | Score Changes (top 3), Findings |
| **NGO / civil society** | Evidence of institutional harm or improvement | Score Changes, Findings |
| **General public** | "Who got caught?" headline-level awareness | Subject line + Score Changes |

---

## 3. Information Architecture

### Section Order (top to bottom)

```
┌─────────────────────────────────────────────┐
│  PREHEADER (hidden, 90 chars)               │
├─────────────────────────────────────────────┤
│  HEADER BAR                                 │
│  Logo (left) · Date range (right)           │
├─────────────────────────────────────────────┤
│  OPENING LINE                               │
│  One sentence. Stats only. Scannable.       │
├─────────────────────────────────────────────┤
│  SCORE CHANGES (max 5)                      │
│  Entity · Index · Score → Score · Delta     │
│  Band change indicator · 2 evidence bullets │
├─────────────────────────────────────────────┤
│  CTA 1: Research upsell (inline, subtle)    │
├─────────────────────────────────────────────┤
│  CONFIRMATIONS (max 8, then link out)       │
│  Flat list, no prose per entity             │
├─────────────────────────────────────────────┤
│  FINDINGS (max 3)                           │
│  Cross-entity synthesis, not repetition     │
│  ≥1 must be a weekly pattern observation    │
├─────────────────────────────────────────────┤
│  SIGNALS (max 3)                            │
│  Forward-looking, explicitly unconfirmed    │
├─────────────────────────────────────────────┤
│  WEEKLY STATS BAR                           │
│  Assessed · Proposed · Confirmed · Runs     │
├─────────────────────────────────────────────┤
│  CTA 2: Institutional services (soft)       │
├─────────────────────────────────────────────┤
│  FOOTER                                     │
│  Independence statement · Links · Unsub     │
└─────────────────────────────────────────────┘
```

---

## 4. Section-by-Section Specification

### 4.1 Preheader (hidden text)

- 90 characters max
- Summarizes the issue: stats + top entity
- Example: `"6 downgrades this week. Mistral AI drops 29 points after CSAM findings. Full briefing inside."`
- Generated automatically from pipeline data

### 4.2 Header Bar

- Left: "COMPASSION BENCHMARK" wordmark (plain text, not image — better deliverability)
- Right: Date range (e.g., "Apr 10–16, 2026")
- Background: #0b1220
- Bottom border: 1px solid rgba(125,211,252,0.15)
- Height: ~48px

### 4.3 Opening Line

**One sentence. No paragraph.** The reader should know what happened in 3 seconds.

Format:
> This week: {N} entities assessed across {M} indexes. {P} score changes ({direction}){band note}. {C} scores confirmed.

Examples:
- "This week: 19 entities assessed across 5 indexes. 10 score changes (all downgrades, 6 band changes). 9 scores confirmed."
- "This week: 4 entities assessed across 2 indexes. 1 upgrade. 3 scores confirmed."

Rules:
- No adjectives ("significant", "notable")
- No hedging
- Entity count, index count, proposal count, direction, band changes, confirmations — in that order

### 4.4 Score Changes (max 5 entities)

Sort by absolute delta descending. Hard cap at 5. Remaining available at /updates.

**Per entity row:**

```
┌──────────────────────────────────────────┐
│ ▪ Mistral AI                    AI Labs  │
│   76.4 → 46.9   ↓ 29.5 pts             │
│   Established → Functional    ● High     │
│                                          │
│   • Enkrypt AI found Pixtral models 60x  │
│     more likely to generate CSAM than    │
│     OpenAI GPT-4o                        │
│   • 68% adversarial success rate across  │
│     tested models                        │
└──────────────────────────────────────────┘
```

Elements per row:
- **Band dot** (▪ colored Unicode) + **Entity name** (bold, 15px) + **Index** (right-aligned, muted)
- **Score line**: Published → Proposed, delta with arrow (↑/↓), colored by direction
- **Band change** (if applicable): Old → New band labels + **Confidence** level
- **Evidence**: Exactly 2 bullets. No more. Each starts with the source (who found it), then the finding.

Color coding:
- Delta ≤ -10: #f87171 (red)
- Delta < 0: #fb923c (orange)
- Delta ≥ 10: #86efac (green)
- Delta > 0: #34d399 (teal)

Band dots use the standard band colors:
- Critical: #f87171
- Developing: #fb923c
- Functional: #fcd34d
- Established: #86efac
- Exemplary: #7dd3fc

### 4.5 CTA 1 — Research Upsell (after Score Changes)

Placement: Immediately after the last score change card. This is when interest peaks.

Copy (exact):
> "Full reports for assessed entities — dimension-level scores, evidence citations, methodology notes — are at compassionbenchmark.com/purchase-research."

Rules:
- Plain text with a single link. No button.
- No urgency language. No "Don't miss."
- Color: muted (#8fa3be), slightly smaller than body text (13px)
- The research sells itself if the free signal is credible.

### 4.6 Confirmations (max 8)

Flat list, no prose explanation per entity.

Format:
```
Scores Confirmed

Amazon (Fortune 500): 21.6 published, 18.4 assessed (−3.2)
Boeing (Fortune 500): 9.1 published, 5.0 assessed (−4.1)
Meta Platforms (Fortune 500): 12.2 published, 10.9 assessed (−1.3)
```

If more than 8 confirmations in the week:
> "{N} entities confirmed within tolerance. [View full list →](https://compassionbenchmark.com/updates)"

### 4.7 Findings (max 3)

**This is what differentiates the newsletter from the daily page.**

Rules:
- Each bullet is a cross-entity or cross-index synthesis observation
- At least one must be a weekly pattern finding that doesn't appear in any single daily digest
- No repetition of score change evidence — this section interprets, not reports
- Each finding is a complete, standalone observation in 1–3 sentences
- No hedging except where factually necessary
- No "significant" or "notable" — let the data carry weight

Example:
> "All four assessed AI labs received downgrade proposals this week. Combined delta: −88 points. The sector's published scores were calibrated on safety commitments that have since been conditioned on commercial expediency."

### 4.8 Signals (max 3)

Forward-looking risk signals. Explicitly unconfirmed.

Rules:
- Each signal names a specific upcoming event, regulatory date, or emerging pattern
- Include the date/timeline when known
- Label as forward-looking, not findings
- Fewer is more credible — hard cap at 3

Format:
```
⚠ EU AI Act high-risk enforcement begins Aug 2, 2026 (108 days).
  All four AI labs assessed this week face significant exposure.

⚠ OpenAI stalking lawsuit (filed Apr 10) post-dates applied score.
  Reassessment within 30-60 days recommended.
```

### 4.9 Weekly Stats Bar

Compact, single row or 2×2 grid. Operational credibility, not headline content.

```
Assessed: 19 │ Proposed: 10 │ Confirmed: 9 │ Runs: 2 │ Total tracked: 1,155
```

### 4.10 CTA 2 — Institutional Services (soft)

Placement: After stats bar, before footer.

Copy (exact):
> "Working on an ESG report, institutional brief, or policy position involving these rankings? We offer licensed data and structured briefings for institutional use. Reply to this email."

Rules:
- Reply-to-email CTA (outperforms link CTAs for high-consideration B2B)
- No button. Plain text.
- Color: muted, same treatment as CTA 1

### 4.11 Footer

Three parts, separated by thin dividers:

**Independence statement** (verbatim, every issue):
> "Scores reflect the 8-dimension, 40-subdimension Compassion Framework. Entities never pay for inclusion, score changes, or suppression of findings."

**Navigation links**:
- View daily findings → compassionbenchmark.com/updates
- Explore all indexes → compassionbenchmark.com/indexes
- Methodology → compassionbenchmark.com/methodology
- Purchase research → compassionbenchmark.com/purchase-research

**Legal / unsubscribe**:
> "You received this because you subscribed at compassionbenchmark.com. [Unsubscribe](#)"

---

## 5. Editorial Voice

**Model**: Policy brief crossed with a wire-service alert. Think Bloomberg terminal, not blog.

| Do | Don't |
|----|-------|
| Declarative, active voice | Passive voice in score descriptions |
| Let numbers carry weight | Use "significant", "notable", "remarkable" |
| Name the source of evidence | Say "reports indicate" without naming who |
| Hedge only in Signals section | Hedge everywhere ("may suggest", "appears to") |
| "Amazon's score fell 4.2 points" | "A score decrease was observed for Amazon" |
| Short sentences, high density | Long narrative paragraphs |

**Editor's note**: The optional override field in the generator is the one place for a human editorial voice. Max 2 sentences. Used sparingly — when there's a genuinely unusual week that warrants framing.

---

## 6. Subject Line Strategy

**Pattern**: Specific entity or sector + direction of movement + implication.

**Format from generator** (preserve):
> `Compassion Benchmark | {date range}: {change summary} — {top 3 entity names}`

**Alternative subject lines for A/B testing** (when email platform supports it):
- "Three AI labs dropped below 40 this week. One is in your procurement stack."
- "New evidence changed Rwanda's score. Here is what it was."
- "Fortune 500 accountability scores: the widest spread we have recorded."

**Preheader** (generated alongside subject):
- 90 chars max
- Complements subject line — adds detail the subject omitted
- Example subject: "6 downgrades, 3 band changes — Mistral AI, Anthropic, Rwanda"
- Example preheader: "Largest single-entity drop in pipeline history. Plus: UnitedHealth DOJ probe, Walmart FTC."

---

## 7. Typography (Email)

All inline styles. No `<style>` block dependency (Gmail strips it). Progressive enhancement only.

| Element | Size | Weight | Color | Line-height |
|---------|------|--------|-------|-------------|
| Newsletter title | 28px | 700 | #e8eefb | 1.1 |
| Section label (h2) | 13px | 600 | #7dd3fc | 1.3 |
| Entity name | 15px | 600 | #e8eefb | 1.3 |
| Score / delta | 14px | 500 | band color | 1.3 |
| Body text | 14px | 400 | #b8c6de | 1.6 |
| Evidence bullets | 13px | 400 | #8fa3be | 1.5 |
| Caption / CTA text | 13px | 400 | #8fa3be | 1.5 |
| Footer | 12px | 400 | #8fa3be | 1.5 |

**Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`

---

## 8. Color Strategy

**Primary**: Dark theme matching the website.

| Token | Value | Usage |
|-------|-------|-------|
| Background | #0b1220 | Email body |
| Card bg | #111827 | Score change cards |
| Text primary | #e8eefb | Headlines, entity names |
| Text secondary | #b8c6de | Body text, descriptions |
| Text muted | #8fa3be | Captions, CTAs, footer |
| Accent | #7dd3fc | Section labels, links |
| Border | rgba(255,255,255,0.10) | Section dividers |
| Delta negative | #f87171 / #fb923c | Score drops |
| Delta positive | #86efac / #34d399 | Score increases |

**Light mode fallback**: Progressive enhancement via `@media (prefers-color-scheme: light)` in `<style>` block. Not a dependency — dark theme remains readable even when forced to white backgrounds.

---

## 9. Score Visualization (Email-Safe)

Use Unicode block characters for compact score bars:

```
▓▓▓▓▓░░░░░  46.9/100
```

- Filled blocks (▓ U+2593) proportional to score out of 10
- Empty blocks (░ U+2591) for remainder
- Colored via inline `<span>` with band color
- Max 10 characters wide
- Renders in all major clients including Outlook

**Do NOT use**: Images for data visualization, emoji as structural indicators, CSS-only visual elements.

---

## 10. Mobile Optimization

At 480px and below (via `<style>` in `<head>` as progressive enhancement):

- Entity rows collapse to 2 lines: name + band → score + delta
- Body font size increases to 16px
- CTA touch targets: minimum 44px height, full-width
- Side padding reduces from 20px to 16px
- Score visualization bar remains inline (no reflow needed)

Table cells use `display:block` override for stacking on mobile.

---

## 11. Accessibility

- `role="presentation"` on all layout tables
- Descriptive link text: "View full briefing" not "Click here"
- All color-coded elements have text equivalents (never color alone)
- Band indicators include the band name as text, not just a colored dot
- `alt=""` on decorative elements; `alt="Compassion Benchmark"` on logo
- Preheader text summarizes content for screen readers
- Score deltas include screen-reader-only text: "decreased by 29.5 points"

---

## 12. CTA Rules (What NOT To Do)

| Never | Why |
|-------|-----|
| Countdown timers | Undermines institutional credibility |
| Discount/urgency language | "Don't miss" cheapens research |
| Testimonials from scored entities | Independence conflict |
| Sponsored content from any indexed entity | Violates independence policy |
| "Exclusive for subscribers" framing | Turns newsletter into sales channel |
| Multiple buttons/banners | Credibility = restraint |
| Share buttons / "forward to a friend" | Let content quality drive sharing |
| Repeated CTAs | One research CTA, one services CTA. Period. |

---

## 13. Generator Changes Required

The current `generate-newsletter.mjs` needs these updates to implement this template:

### New outputs needed:
1. **Preheader text** (90 chars) — generated alongside subject line
2. **HTML email** output in addition to markdown (new template file)
3. **UTM-tagged links** on all URLs (`utm_source=newsletter&utm_medium=email&utm_campaign=weekly-{date}`)

### Content rule changes:
4. **Score changes capped at 5** (currently unlimited)
5. **Confirmations capped at 8** with overflow link (currently unlimited)
6. **Findings capped at 3** (currently 5)
7. **Signals capped at 3** (already 3 — confirmed)
8. **Weekly synthesis finding** — at least one Findings bullet must be a cross-entity pattern observation not in any single daily digest (requires editorial override field or agent-generated synthesis)

### Format changes:
9. **Opening line** reduced from paragraph to single sentence
10. **Confirmation section** simplified to flat list (no threshold explanation prose)
11. **CTA 2** added (institutional services, reply-to-email)
12. **Stats section** compressed to single-line format
13. **Editor's note field** preserved (already exists via overrides)

---

## 14. Measurement Plan

### Core KPIs (review weekly)

| KPI | What it measures | Target (Month 1) | Target (Month 3) |
|-----|-----------------|-------------------|-------------------|
| Subscriber growth rate | Is content worth recommending? | 100–200 total | 300–600 total |
| Click-to-open rate (CTOR) | Content relevance among readers | 30–40% | >20% stabilized |
| Newsletter-attributed Gumroad revenue | Direct business impact | 1–2 conversions | $200–500/month |
| Unsubscribe rate per issue | Trust/expectation alignment | <0.5% | <0.3% |

### Attribution

- All Gumroad links carry UTM params: `utm_source=newsletter&utm_medium=email&utm_campaign=weekly-YYYY-MM-DD`
- Per-section tracked links: separate URLs for score changes, findings, signals sections
- Click distribution across sections = content performance proxy

### What NOT to track
- Raw open rate (unreliable post-iOS 15)
- Total subscriber count as success metric
- Social shares per issue (too low-volume)

---

## 15. Sample Issue (Annotated)

Below is a complete sample issue showing how the template renders with real data from the Apr 10–16, 2026 pipeline run.

---

**Subject**: Compassion Benchmark | Apr 10–16: 10 downgrades, 6 band changes — Mistral AI, Anthropic, OpenAI

**Preheader**: Largest single-entity drop in pipeline history. Plus: Rwanda crimes against humanity, UnitedHealth DOJ probe.

---

### COMPASSION BENCHMARK                                         Apr 10–16, 2026

---

This week: 19 entities assessed across 5 indexes. 10 score changes (all downgrades, 6 band changes). 9 scores confirmed.

---

**SCORE MOVEMENTS**

▪ **Mistral AI** · AI Labs
76.4 → 46.9 · ↓ 29.5 pts
Established → Functional · High confidence
• Enkrypt AI found Pixtral models 60x more likely to generate CSAM than GPT-4o
• 68% adversarial success rate — refusal mechanisms effectively broken
▓▓▓▓▓░░░░░ 46.9

▪ **Anthropic** · AI Labs
90.9 → 68.8 · ↓ 22.1 pts
Exemplary → Established · High confidence
• Head of Safeguards resigned citing commercial pressure overriding safety values
• RSP v3.0 loosened pause commitment days after Pentagon contract threat
▓▓▓▓▓▓▓░░░ 68.8

▪ **OpenAI** · AI Labs
60.8 → 40.6 · ↓ 20.2 pts
Functional → Developing · High confidence
• New Yorker investigation: CEO exhibits 'consistent pattern of lying' about safety
• Superalignment team received 1–2% compute vs. promised 20%
▓▓▓▓░░░░░░ 40.6

▪ **Israel** · Countries
27.8 → 8.8 · ↓ 19.0 pts
Developing → Critical · High confidence
• 72,289 Palestinians killed in Gaza since Oct 2023; 172,040 injured
• UNRWA banned from bringing staff or aid into Gaza since March 2025
▓░░░░░░░░░ 8.8

▪ **Rwanda** · Countries
41.8 → 30.0 · ↓ 11.8 pts
Functional → Developing · Medium confidence
• US Treasury sanctioned 4 senior RDF officials for supporting M23 rebels
• UN found reasonable grounds for crimes against humanity by M23/RDF
▓▓▓░░░░░░░ 30.0

_Full reports for assessed entities — dimension-level scores, evidence citations, methodology notes — are at compassionbenchmark.com/purchase-research._

---

**SCORES CONFIRMED**

Amazon (Fortune 500): 21.6 → 18.4 (−3.2)
Boeing (Fortune 500): 9.1 → 5.0 (−4.1)
Meta Platforms (Fortune 500): 12.2 → 10.9 (−1.3)
Sudan (Countries): 0.0 → 0.0 (0.0)
Iran (Countries): 2.8 → 1.6 (−1.2)
Myanmar (Countries): 0.0 → 0.0 (0.0)
Exxon Mobil (Fortune 500): 9.1 → 7.8 (−1.3)
Ukraine (Countries): 50.0 → 46.9 (−3.1)

1 additional entity confirmed. View all at compassionbenchmark.com/updates

---

**FINDINGS**

All four assessed AI labs received downgrade proposals this week. Combined delta: −88 points across Mistral, Anthropic, OpenAI, and xAI. Published scores were calibrated on safety commitments that the 2025–2026 evidence base has systematically dismantled. The AI Labs index requires comprehensive reassessment.

Accountability is the most consistently damaged dimension across every sector assessed. Boeing (5.0), xAI (2.5), J&J (10.0), Israel (2.5), UnitedHealth (10.9) — harm was acknowledged only under legal or regulatory compulsion in every case. This is structural, not entity-specific.

Rwanda's split profile — genuine development achievements coexisting with documented crimes against humanity — previews a recurring assessment challenge. Entities with strong institutional self-reporting consistently overstate their compassion profiles relative to primary-source evidence.

---

**SIGNALS**

⚠ EU AI Act high-risk enforcement begins Aug 2, 2026 (108 days). All four AI labs assessed this week face direct exposure. Mistral's CSAM failures are relevant to prohibited practices.

⚠ OpenAI stalking lawsuit (Apr 10) post-dates the applied score of 40.6. Three internal safety flags were ignored. Reassessment recommended within 30–60 days.

⚠ UnitedHealth heading toward structural governance collapse. Three CEOs in 12 months, active DOJ criminal investigation, and $50B market cap erosion. High volatility watch.

---

Assessed: 19 · Proposed: 10 · Confirmed: 9 · Runs: 2 · Tracked: 1,155

---

_Working on an ESG report, institutional brief, or policy position involving these rankings? We offer licensed data and structured briefings for institutional use. Reply to this email._

---

Scores reflect the 8-dimension, 40-subdimension Compassion Framework. Entities never pay for inclusion, score changes, or suppression of findings.

View daily findings · Explore all indexes · Methodology · Purchase research

You received this because you subscribed at compassionbenchmark.com. Unsubscribe

---

## 16. Implementation Sequence

1. Update `generate-newsletter.mjs` with content caps, preheader, UTM links, compressed format
2. Create HTML email template (table-based, inline styles) as a companion output
3. Select email sending platform (Buttondown recommended for simplicity + dark theme support)
4. Configure Formspree → email platform subscriber sync
5. Send first issue following next full week of pipeline data
6. Instrument UTM tracking on Gumroad links
7. Review KPIs after 4 issues (1 month)
