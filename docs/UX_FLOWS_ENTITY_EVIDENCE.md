# UX Flows: Entity Evidence Traceability and Retention Visibility

**Version:** 1.0
**Date:** 2026-05-26
**Author:** UX Designer Agent
**Status:** Ready for engineering handoff
**Downstream:** frontend-engineer, qa-engineer, product-manager

---

## 0. Context and Constraints

**What exists today on the entity page (EntityDetail.tsx):**

1. Hero section — entity name, band, rank, composite score, metadata
2. Evidence-review freshness stamp — scanner date, evidence-found indicator, one-line summary (conditionally rendered when `evidenceReview` prop is populated)
3. Floor-designation disclosure — only for entities with `composite = 0`
4. Latest score change callout — "Latest research update" panel with date, delta, headline, and "View briefing" link (conditionally rendered when `latestChange` prop is populated)
5. Dimension bars — 8-dimension breakdown
6. Entity-scoped CTAs section — Score-Watch, dataset purchase, newsletter

**What does NOT exist today:**

- Citation source link (authoritative external evidence source on the entity page)
- Inline sparkline on the entity page itself (exists only on the `/history` page)
- Link to methodology rulings that affected this entity
- Explicit Tier A/B/C/D visibility model surfaced to the visitor
- Sub-threshold movement rollup language

**History page (HistoryTimeline.tsx) is fully built.** It contains the complete event timeline, the CompositeSparkline, the Score-Watch sidebar, and back-navigation to the entity page. The Score-Watch commercial CTA lives there. The entity page evidence card must NOT duplicate that CTA.

**Independence policy constraint:** Evidence presentation is strictly factual and neutral. Commercial surfaces remain in the CTAs section only. The evidence card is research content.

---

## 1. User Journeys

### Journey A — Returning Visitor Checking on Turkey

**Entry:** User navigates to `/country/turkey` directly (bookmark or search box result).

**Screens touched:**

1. `/country/turkey` — entity page loads
2. User scans the hero: band is Critical, score is 15.1. They remember it was higher before.
3. User reaches the evidence card (positioned after the hero, before dimensions — see Section 2). They see "May 24, 2026 · 3 days ago · −2.5 · Riot police seized CHP headquarters following court order." They see a citation link to the briefing source.
4. They notice the "3 scored events in last 7 days" summary in the card and click "View full history →".
5. On `/country/turkey/history`, they see the sparkline's steep decline and the full sequence: May 20 baseline established, May 22 boundary watch, May 23 −4.9 band-crossing, May 24 −2.5.
6. They share the history page URL with a colleague.

**Bounce moment:** If the entity page shows only the current score and dimensions with no indication of recent change, a returning visitor with context has no hook. They see no delta, no "why," and navigate away.

**Convert moment:** The evidence card showing the date, delta, and a one-line headline — with a direct link to the full history — gives the returning visitor immediate orientation. The moment they see "−2.5 · 3 days ago" they understand a change occurred and have a clear action path. Conversion here means continued engagement with the history page and increased likelihood of Score-Watch signup (on the history page, not the entity page).

---

### Journey B — Journalist Researching Slovakia

**Entry:** Google search for "Slovakia EU funding conditionality benchmark" → lands on `/country/slovakia`.

**Screens touched:**

1. `/country/slovakia` — entity page loads cold
2. User sees band (Low-Performing or similar), score, and rank. No prior context.
3. User reaches the evidence card. They see the most recent scored event: date, delta, one-line headline referencing EU conditionality. They see a citation link labeled with the source name (e.g., "EU Parliament — May 25, 2026") that opens in a new tab.
4. User clicks the citation link. External source confirms the EU Parliament press release language matches the benchmark's assessment.
5. User clicks "View full history →" to understand the trajectory.
6. On `/country/slovakia/history`, they find dated entries they can cite individually. The URL `/country/slovakia/history` is the citable permalink. Each briefing link on the history page provides a second stable URL.

**Bounce moment:** If the evidence card has no citation link — only a headline — the journalist cannot verify the claim against a primary source. They cannot cite the benchmark without that anchor. They will leave.

**Convert moment:** The citation link to the authoritative source (the EU Parliament press release, not an internal briefing) is the critical element. Once a journalist can verify the claim against a primary source AND see a dated permalink they can link to, the benchmark becomes citable. This is the convert moment: they return the URL to their editor, which may drive referral traffic and future return visits.

---

### Journey C — Investor Evaluating Anthropic

**Entry:** `/ai-labs` index page → clicks Anthropic row → `/ai-lab/anthropic`.

**Screens touched:**

1. `/ai-labs` index — user sees Anthropic's rank and composite in the table
2. `/ai-lab/anthropic` — entity page loads
3. User reads the hero: composite score, band, rank among 50 labs.
4. User reaches the evidence card. Most recent event is a boundary-watch cycle. The card shows "Boundary watch — cycle 3 · May 25, 2026" with the watch headline and a "View full history →" link. No delta shown (boundary-watch has `delta: null`). The card instead shows "No score change this cycle — monitored for next apply threshold."
5. User notices a methodology ruling note in the card: "Ruling applied: AI lab sector — safety-boundary threshold. Read methodology →". They click it, land on `/methodology#boundary-watch`, read the ruling.
6. User returns to entity page, satisfied that the institution has a documented reason for not changing the score and is actively monitoring. They sign up for Score-Watch via the CTAs section below the dimensions.

**Bounce moment:** If the evidence card only surfaces score changes (delta != 0) and is blank for boundary-watch states, the investor sees an un-updated-looking page and distrusts the data currency. They leave.

**Convert moment:** Showing the boundary-watch status explicitly — with the cycle count and the methodology link — demonstrates active monitoring even when no score change occurred. The investor understands that the institution is watching, not asleep. This is the moment they may proceed to the Score-Watch CTA below the dimensions, completing a conversion.

---

## 2. Screen-Level Layout for the Entity Page

### Placement Decision

**Selected placement: after the hero section, before the dimension bars.**

The existing page structure is:

```
1. Hero (score, band, rank, metadata)
2. Evidence-review freshness stamp  [EXISTING — thin strip, conditional]
3. Floor-designation disclosure     [EXISTING — conditional, zero-floor only]
4. Latest score change callout      [EXISTING — Panel, conditional]
5. Dimension bars
6. CTAs section
7. Footer nav
```

The existing "Latest score change callout" (section 4 above) is the right structural position but is currently underpowered: it shows date, delta, headline, and a "View briefing" link, but does NOT show a citation source link, does NOT show a sparkline, does NOT show a methodology ruling note, and does NOT link to the full history page. This feature request is an extension and enrichment of that existing section, not a new insertion.

**Why this placement:** Users scanning an entity page follow a top-down information hierarchy: who is this entity → what band are they in → what happened recently → why → where do I go deeper. The evidence card sits at step 3 and 4 in that hierarchy, which is immediately after the score is established and before the dimension breakdown explains composition. Placing it after the hero means every user who reads past the fold sees it. Placing it before dimensions means the "why did the score change" question is answered before the "what dimension drove it" question, which is the correct narrative order.

**Why not above the hero:** Would crowd the most important identifier information (name, score, band) with a temporal detail that requires context.

**Why not a sidebar callout:** Mobile layout breaks sidebars into stacked columns. The entity page already uses a two-column hero layout on desktop with the composite score box at right; a third sidebar element creates a visual priority conflict.

**Why not a horizontal strip:** The strip pattern (currently used for the evidence-review freshness stamp) is correct for single-line status indicators. The evidence card contains 4-6 fields and needs a Panel treatment, not a strip.

### Page Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  COMPASSION BENCHMARK                          [nav]                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ── HERO ───────────────────────────────────────────────────────── │
│  Countries › Turkey                                                 │
│                                                                     │
│  Countries · 2026                    ┌──────────────────────────┐  │
│  Turkey                              │  Composite score         │  │
│  ██ Critical   Rank #157 of 193      │  15.1                    │  │
│                                      │  out of 100              │  │
│  View score history →                └──────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [thin strip: Evidence reviewed · May 26, 2026 · New evidence...]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ── EVIDENCE CARD ─────────────────────────────────────── [NEW] ── │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ LATEST RESEARCH UPDATE    2026-05-24  ·  3 days ago        │    │
│  │                                                            │    │
│  │  ▼ −2.5      15.1   ██ Critical band                       │    │
│  │                                                            │    │
│  │  Riot police physically seized and occupied CHP            │    │
│  │  headquarters on May 24 — state-security enforcement       │    │
│  │  of the May 21 judicial leadership removal.               │    │
│  │                                                            │    │
│  │  Source: Briefing — May 24, 2026 ↗                        │    │
│  │                                                            │    │
│  │  ─────────────────────────────────────────────────────    │    │
│  │                                                            │    │
│  │  [sparkline: Apr 30 · 22.5 ─── May 22 · 20.6 ─ 15.1]    │    │
│  │   6 scored events · 4 boundary watch cycles               │    │
│  │                                                            │    │
│  │                          View full history →               │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ── DIMENSION BARS ─────────────────────────────────────────────── │
│  8 dimensions, scored 0–5  [existing, unchanged]                    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ── CTAs SECTION ───────────────────────────────────────────────── │
│  Score-Watch Alert  |  Full dataset purchase  |  Newsletter        │
│  [existing, unchanged — commercial surface]                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Implementation note for engineering:** The current "Latest score change callout" section in EntityDetail.tsx (lines 297-347) renders when the `latestChange` prop is populated. This section should be replaced with the new EvidenceCard component. The `latestChange` prop interface needs two new optional fields: `citationUrl` and `citationLabel`. The sparkline renders from the full `EntityHistory` events array, which requires passing an additional prop or merging the history data into the entity page at build time.

---

## 3. Evidence Card Content and Interactions

### Fields

| Field | Source | Notes |
|---|---|---|
| Section label | Static | "LATEST RESEARCH UPDATE" — eyebrow treatment, muted uppercase |
| ISO date | `latestChange.date` | "2026-05-24" in muted monospace |
| Relative time | Computed at render | "3 days ago" — derived from ISO date vs. current build date; shown next to ISO date, not replacing it |
| Delta badge | `latestChange.delta` | "▼ −2.5" in `--color-band-orange` for negative; "▲ +1.5" in `--color-band-green` for positive; "◆ Hold" in muted for delta 0; omitted if null (boundary-watch only entry) |
| New composite | `latestChange.publishedScore` | Tabular number after the delta badge |
| Band pill | `latestChange.bandChange` or always | Show band if it changed; if no band change, omit to reduce visual noise |
| Headline | `latestChange.headline` | One-line, truncated at 160 chars with ellipsis; full text on hover/focus via `title` attribute |
| Citation link | `latestChange.citationUrl` + `latestChange.citationLabel` | "Source: [label] ↗" — opens in new tab; rendered only when `citationUrl` is present |
| Status badge | `latestChange.status` | Shown as a small pill when status is "boundary-watch": "Boundary watch — cycle N" in accent-colored pill; "Applied" for scored changes; omitted for "documented" (adds noise without information) |
| Methodology ruling note | `latestChange.methodologyRuling` | Optional single-line: "Ruling applied: [name] · Read methodology →" — shown only when a ruling was established on this event's date; link to `/methodology#[ruling-slug]` |
| Sparkline | `EntityHistory.events` | Inline 48px height; shows last 5-8 scored events including current; reuses `CompositeSparkline` at reduced height |
| Event count summary | `EntityHistory.scoredEventCount`, `boundaryWatchCount` | "N scored events · N boundary watch cycles" in muted text below sparkline |
| History link | `historyHref` | "View full history →" right-aligned within card; only rendered when `historyHref` is populated (entity has history) |

### Interaction Patterns

**Card clickability:** The card as a whole is NOT a link. Making the full card a link to `/history` would conflict with the citation link (external, new tab) inside the card. Two link targets cannot share a single click region cleanly. Instead:
- "View full history →" is a dedicated text link to the history page
- The citation link is a separate `<a target="_blank">` within the card
- The briefing date (ISO date) is a text link to `/updates/[date]`

**Citation link:** Opens in a new tab (`target="_blank"` with `rel="noopener noreferrer"`). Marked with ↗ symbol and `aria-label="[citation label], opens in new tab"`. This is the authoritative external source, not an internal briefing link.

**Hover/focus state:** The card has a subtle background shift on hover (from `rgba(255,255,255,0.02)` to `rgba(255,255,255,0.04)`) to signal interactivity of contained links. The card border highlights to `--color-line-hover` on focus-within (using CSS `:focus-within`). Individual links within the card follow existing hover patterns: accent color on hover, underline on focus.

**Empty/missing state (no scored events yet):** When `latestChange` is null (entity has never received a scored event), the evidence card is not rendered at all. The entity page falls back to showing only the hero and dimensions. The "View score history →" link in the hero is also conditionally omitted when `historyHref` is null. No placeholder or "no recent changes" message is shown at the entity page level — that messaging lives on the history page's empty state, which is more contextually appropriate.

**Boundary-watch only state (no score change, but entity is being watched):** If the most recent event is a `boundary-watch` type with `delta: null`, the delta badge shows "Boundary watch" pill rather than a delta value. Headline is still shown. "View full history →" still appears. The card communicates active monitoring without falsely implying a score change occurred.

---

## 4. Retention Visibility Model (Visitor-Facing)

The engineering data tier model translates to a visitor experience as follows:

### Tier A — On the Entity Page Itself

Surfaces: the most recent scored event (or boundary-watch cycle if that is the latest activity), the sparkline showing the last 5-8 scored events, and any methodology ruling that affected the entity on the most recent event date.

This is what the visitor sees without any click. Tier A is "one card, one sparkline, one ruling note."

### Tier B — One Click to the History Page

Surfaces: every scored event and every boundary-watch cycle in the full research record, in reverse-chronological order. Each entry links to its source briefing.

Link text on the entity page: "View full history →"

The history page is the full research record for a single entity. It does not require any purchase or sign-up.

### Tier C — Reachable via Updates Archive and Search

Surfaces: all briefing dates where the entity appeared in `topSignals` or `recentAssessments`, including dates where it was assessed but had delta 0 (documented holds not represented in the entity history events array).

Link path: entity page → history page bottom → "Browse all briefings mentioning [Turkey] →" → `/updates/archive?entity=turkey` (pre-filtered).

This link appears at the bottom of the history timeline, below the last event card, as a secondary nav element. It is NOT in the evidence card on the entity page.

### Tier D — Collapsed Sub-Threshold Summary

Sub-threshold movements (movements below the formal apply threshold) are summarized, not individually listed. They appear at the bottom of the history page timeline (below the last scored event card) as a collapsed summary line.

**Pattern:**

```
┌──────────────────────────────────────────────────────────────┐
│  47 sub-threshold movements between Apr 15 – May 25, 2026   │
│  These did not reach the formal apply threshold.            │
│  Earlier sub-threshold detail is available in the archive → │
└──────────────────────────────────────────────────────────────┘
```

- "Earlier sub-threshold detail is available in the archive →" links to the filtered archive search.
- This block is always collapsed visually — it is a summary strip, not an expandable list. The archive is the right surface for sub-threshold detail; the history page is for scored events.
- The count ("47 sub-threshold movements") comes from `boundaryWatchCount` in the history JSON, which is already computed.

### Discoverability Without Noise

The tier model is not labeled as such for visitors. The visitor experience is:

1. Entity page: see the most recent event (Tier A) and a sparkline of trajectory.
2. Click "View full history →": see every scored event (Tier B).
3. At the bottom of history: see "47 sub-threshold movements" summary, with a link to the archive for detail (Tier C/D path).
4. No visitor-facing tier labels. The architecture is transparent through navigation, not through explaining the architecture.

---

## 5. Mobile Considerations

### Evidence Card at 375px

The evidence card renders as a full-width Panel. The two-column layout within the card (delta badge left, new composite right) collapses to a single column: delta badge on its own row, new composite and band pill on the next row.

```
LATEST RESEARCH UPDATE  2026-05-24 · 3 days ago

▼ −2.5
15.1  ██ Critical

Riot police physically seized and occupied CHP
headquarters on May 24...

Source: Briefing — May 24, 2026 ↗

────────────────────────────────────

[sparkline, full width, 40px height]
6 scored events · 4 boundary watch cycles

                       View full history →
```

The "View full history →" link is right-aligned within the card. On 375px this keeps it visually distinct from the source link above it without requiring full-width button treatment (which would imply it is a CTA, not a navigation link — wrong visual register for research content).

### Sparkline at Mobile Width

`CompositeSparkline` renders `width="100%"` via `viewBox` scaling. The SVG `viewBox` is fixed at 400×64 internally but scales to container width. At 375px, after standard container padding, the available width is approximately 327px. The sparkline remains readable at this width. The right-side value label (e.g., "15.1") which is positioned at `lastPt.x + 8` may clip at very small widths if the last point is near the right edge. The existing component's `PAD_RIGHT = 48` handles this; no change required.

At 375px, height should be reduced to 40px for the inline entity-page usage (as opposed to the 64px used on the full history page). Pass `height={40}` to the reused component.

---

## 6. Accessibility

### Evidence Card ARIA Structure

```
<section aria-label="Latest research update for [entity name]">
  <article role="article" aria-label="Score change on [date]: [delta description]">
    ...card content...
  </article>
</section>
```

- The section label ties the card to the entity, which matters for screen readers navigating by landmark.
- The article `aria-label` uses the same text-equivalent delta pattern established in `HistoryTimeline.tsx`: "decrease of 2.5 points" not "▼ −2.5".

### Color-Only Indicators

- Delta badge colors (orange for negative, green for positive) must have text equivalents. The existing `DeltaBadge` component in HistoryTimeline.tsx uses `aria-label` correctly (e.g., `aria-label="decrease of 2.5 points"`). The reused or adapted component must preserve this.
- The band indicator color must be accompanied by the band name text ("Critical", "Developing", etc.). The existing `Band` component renders the band name as visible text; do not suppress it.
- The evidence-review freshness dot (orange/green) in the thin strip above the card already uses `aria-hidden` on the dot; ensure the adjacent text ("New evidence surfaced" / "No material change") is always present and not suppressed.

### Keyboard Navigation

Since the card is not itself a link (see Section 3), keyboard users Tab through: (1) the ISO date link to the briefing, (2) the citation link (external), (3) the "View full history →" link. This is a clean tab order with no traps.

Focus should be visually clear on each interactive element. The card's `:focus-within` border highlight gives sighted keyboard users orientation that they are inside the card region.

### Citation Link

`<a target="_blank" rel="noopener noreferrer" aria-label="[citation label], opens in new tab">` is the required pattern. The ↗ glyph is `aria-hidden="true"`. Screen readers hear "EU Parliament May 25 2026, opens in new tab" not "EU Parliament May 25 2026 arrow".

---

## 7. Independence Policy Guardrails

The evidence card is strictly a research surface. The following rules apply:

**What the evidence card contains:**
- Date, delta, score, band, headline, citation source link
- Sparkline of historical trajectory
- Link to the full history page
- Methodology ruling note (when applicable)

**What the evidence card does NOT contain:**
- Score-Watch subscribe CTA or link
- Dataset purchase CTA or link
- Newsletter signup
- Any pricing information
- Any language implying the entity can or should respond to the score

The Score-Watch CTA remains in two locations only:
1. The CTAs section of the entity page (below the dimension bars) — this is clearly a commercial surface, visually distinct from the research sections above it
2. The Score-Watch sidebar on the history page — this is where it lives per the existing HistoryTimeline.tsx design

**Visual distinction between research and commercial surfaces:**

The evidence card uses the same Panel treatment as the existing "Latest score change callout" — `bg-[rgba(255,255,255,0.02)]` with `border-line`. It is visually continuous with the research content above it (hero, freshness stamp).

The CTAs section uses a distinct visual register: gradient backgrounds, accent-colored borders (`border-[rgba(125,211,252,0.35)]`), and large heading type. This differentiation already exists in EntityDetail.tsx and must be preserved.

No Score-Watch copy appears between the hero and the CTAs section. A visitor reading the evidence card sees research. A visitor who scrolls to the CTAs section encounters commercial offerings. The boundary is clear and unambiguous.

**Methodology ruling note language:** When a ruling is surfaced in the evidence card, the copy is neutral and factual: "Ruling applied: [name] · Read methodology →". It does not imply the ruling was contested, unusual, or favorable/unfavorable to the entity. The link goes to the methodology documentation, not to a sales page.

---

## 8. Edge Cases and QA Scenarios

| Scenario | Expected behavior |
|---|---|
| `latestChange` is null (entity never scored) | Evidence card not rendered; "View score history →" hero link not rendered; entity page shows hero and dimensions only |
| `latestChange.delta` is 0 (documented hold) | Delta badge shows "◆ Hold" in muted style; headline still shown; sparkline still shown if history events exist |
| `latestChange.delta` is null (boundary-watch only) | Delta area shows "Boundary watch — cycle N" pill; no numeric delta shown; headline shown |
| `latestChange.citationUrl` is absent | Citation line not rendered; card shows headline only; no empty citation placeholder |
| `historyHref` is null (no history exists) | "View full history →" not rendered inside card; sparkline not rendered (no events data); card shows only the latest change fields |
| `latestChange.methodologyRuling` is absent | Methodology ruling note not rendered; no empty placeholder |
| Entity has only 1 scored event (first baseline) | Sparkline renders single point; event count shows "1 scored event"; "View full history →" still links to history page which shows the single entry |
| Sparkline with 10+ events | Renders all points; the SVG polyline handles arbitrary event counts; no clipping at standard widths |
| Band change in `latestChange` | Band pill is shown in delta row; uses existing `Band` component; colored per band token |
| No band change | Band pill omitted from delta row to reduce visual noise |

---

## 9. Flows Summary for Engineering Handoff

### What changes on the entity page

The existing "Latest score change callout" section (EntityDetail.tsx lines 297-347) is replaced or extended with the new evidence card component. The `latestChange` prop interface gains:

- `citationUrl?: string` — authoritative external source URL
- `citationLabel?: string` — human-readable label for the citation (e.g., "EU Parliament — May 25, 2026")
- `methodologyRuling?: { name: string; slug: string }` — ruling established on this event's date, if any

The entity page also gains an optional `historyEvents` prop (the full events array from the history JSON) to power the inline sparkline. Alternatively, engineering may pass only the last 8 events to keep the payload small.

### New component: EvidenceCard

Replaces the existing Panel inside the "Latest score change" section. Reuses:
- `DeltaBadge` — copy or import from HistoryTimeline.tsx
- `Band` — existing UI primitive
- `CompositeSparkline` — existing component, passed `height={40}` for entity-page inline use

### No new routes required

All changes are within the existing entity page component. The history page (`/country/turkey/history`, etc.) is unchanged.

### Build-time data requirements

The entity page build must supply `citationUrl` and `citationLabel` from the latest scored event's source data. The field mapping from the daily JSON shape (`events[].briefingPath`) to an authoritative external citation URL requires a decision on data sourcing (see Open Question below).

---

## 10. Open Question for Product Manager

**What is the citation source for the evidence card?**

The history JSON (`turkey.json`) contains `briefingPath` (e.g., `/updates/2026-05-24`) as the event's source reference — an internal briefing link, not an external authoritative citation. The journalist use case (Journey B) requires a link to the primary source that caused the score change: the EU Parliament press release, the court decision, the UN report. That primary source URL does not exist in the current data schema.

Before the evidence card can surface a `citationUrl`, the research pipeline must either:
(a) Add a `citationUrl` field to each scored event in the history JSON, populated from the primary evidence source used by the researcher to apply the score change, or
(b) Accept that the citation on the entity page links to the internal daily briefing (which itself contains the full evidence chain), not to the external primary source.

Option (a) is the correct path for journalist credibility and citability. Option (b) is a faster ship but does not fully resolve Journey B. The product manager must decide which is acceptable for the initial release.
