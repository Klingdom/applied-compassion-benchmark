# METRICS_ENTITY_EVIDENCE.md — Entity Evidence Card + Retention Policy

**Version:** 1.0
**Date:** 2026-05-26
**Owner:** Analytics
**Status:** Pre-instrumentation spec
**Upstream artifacts:** PRD_ARCHIVE.md, METRICS_ARCHIVE.md, PR_PLAN_ARCHIVE.md, site/src/components/entity/HistoryTimeline.tsx
**Feature scope:** Evidence card on entity pages (latest score change + link to history timeline); four-tier retention policy (A: always-visible, B: history-page, C: archive-only, D: compactable)

---

## Context note on traffic posture

This site is low-traffic. Statistical significance at the session level is unachievable. All targets in this spec are set at weekly grain and are directional signals, not precision thresholds. The working interpretation is: direction consistent for two consecutive weeks = signal. A single week's movement is noise.

PRs 1-3 (archive landing, entity history pages, RSS/JSON feeds) are merged. PR 4 (Pagefind search) is open. The evidence card and retention policy tiers are new work layered on top of the existing history timeline component in `HistoryTimeline.tsx`.

---

## 1. Measurement Objectives

The feature works if all five of the following directional signals are observed at day-30:

1. **Entity pages generate history-page traffic.** The entity page evidence card should increase the click-through rate from entity pages to `/entity/<slug>/history`. If the card is not producing this flow, it is either invisible, unconvincing, or misplaced.

2. **Visitors who see the evidence card engage more deeply.** Time-on-page on entity pages (measured as average session duration on entity page routes) should increase relative to pre-card baseline, because the card gives researchers a reason to read before navigating rather than bouncing immediately.

3. **The retention tier model is validated, not contradicted.** Tier D (compactable sub-threshold rollups) must not generate expansion rates that suggest we are hiding content visitors actually want. Tier B (history-page) content must not produce high bounce rates that suggest it is not worth the dedicated page.

4. **History-page arrivals track back to the evidence card as the primary source.** The `entity_history_arrival_path` event should show `entity-page` as the dominant source at day-30. If `direct` or `search` dominate instead, the evidence card is not the entry point driving history traffic — the card may be redundant or the SEO surface is doing the work instead.

5. **No independence-policy contamination.** No event payload ever exposes entity-level commercial signal to third-party systems. Umami is self-hosted. The analytics record is not accessible to the entities being measured.

---

## 2. Events to Instrument (Umami Custom Events)

### Event 1: `entity_evidence_card_viewed`

**When it fires:** On entity page load (component mount), conditional on the evidence card being rendered — i.e., `has_evidence: true`. If the entity has no history, this event fires with `has_evidence: false` and can be used to measure the null case.

**Payload:**

| Key | Type | Example | Notes |
|---|---|---|---|
| `slug` | string | `slovakia` | Public entity slug; not PII |
| `has_evidence` | boolean | `true` | Whether a card is actually rendered |
| `event_count` | number | `3` | Total scored events in entity history |
| `days_since_last_change` | number | `4` | Integer days; null-safe to 9999 if no change ever |

**Why track it:** Establishes the denominator for all downstream engagement rates. Without this impression event, click-through rates cannot be computed. Also surfaces the distribution of evidence card presence across entities, which informs whether Tier A content is sparse or dense.

---

### Event 2: `entity_evidence_card_clicked`

**When it fires:** On any click interaction within the evidence card component (history link, citation link if present, sparkline click, or card body click).

**Payload:**

| Key | Type | Example | Notes |
|---|---|---|---|
| `slug` | string | `anthropic` | Entity slug |
| `target` | string | `history-link` | One of: `history-link`, `citation-link`, `sparkline`, `card-body` |

**Why track it:** Distinguishes which element of the card drives navigation. If `sparkline` never gets clicks but `history-link` drives all traffic, the sparkline interaction may be removable. This is the primary conversion event for the evidence card feature.

---

### Event 3: `entity_history_arrival_path`

**When it fires:** On `/entity/<slug>/history` page load (component mount in `HistoryTimeline.tsx`). Derives source from the router's navigation context or a `from` query parameter passed by internal links. Do not rely on `document.referrer` alone for same-origin SPA navigation (this ambiguity is flagged in METRICS_ARCHIVE.md Flag 5 and remains unresolved; frontend engineer must implement via router history or query param).

**Payload:**

| Key | Type | Example | Notes |
|---|---|---|---|
| `slug` | string | `turkey` | Entity slug |
| `source` | string | `entity-page` | One of: `entity-page`, `archive`, `direct`, `search`, `other` |

**Why track it:** This is the primary attribution signal for the evidence card. If `entity-page` is not the dominant source at day-30, the card is not driving the conversion it was built for. Also validates whether archive pages (Tier C) are sending traffic back to entity history pages.

---

### Event 4: `entity_methodology_ruling_viewed`

**When it fires:** When a methodology ruling callout within the evidence card or timeline becomes visible via Intersection Observer (≥50% of element in viewport). Fire once per ruling per page session — do not re-fire on scroll-past.

**Payload:**

| Key | Type | Example | Notes |
|---|---|---|---|
| `slug` | string | `slovakia` | Entity slug |
| `ruling_number` | number | `5` | The ruling number from methodology notes |

**Why track it:** Validates whether Tier A content (methodology rulings, always-visible) is actually being consumed. A ruling with zero impressions across multiple weeks is either below the fold, visually inert, or genuinely unimportant to visitors. This drives tier re-evaluation decisions.

**Deprioritize for Phase 1.** Intersection Observer instrumentation has implementation overhead. Ship in Phase 2.

---

### Event 5: `entity_sub_threshold_rollup_expanded`

**When it fires:** On user click to expand a compactable Tier D rollup (sub-threshold score events below the display threshold, collapsed by default).

**Payload:**

| Key | Type | Example | Notes |
|---|---|---|---|
| `slug` | string | `3m` | Entity slug |
| `rollup_count` | number | `4` | Number of events hidden in the rollup |
| `age_days` | number | `18` | Age of the oldest event in the rollup, in days |

**Why track it:** This is the primary retention-policy validation event. A high expansion rate means Tier D is too aggressive — visitors are actively seeking content we compacted. A zero expansion rate over four weeks means Tier D is correct and compaction can be extended more aggressively.

---

## 3. Funnel Definitions

### Funnel 1: Awareness to Research to Conversion

This is the primary value funnel for the evidence card feature. It measures whether the card successfully converts a casual entity-page visitor into a history researcher and ultimately into a Score-Watch subscriber or a returning visitor.

```
Step 1: Session lands on entity page (any /country/<slug>, /company/<slug>, etc.)
        → entity_evidence_card_viewed fires

Step 2: Session clicks the evidence card
        → entity_evidence_card_clicked fires (target: history-link)

Step 3: Session arrives on /entity/<slug>/history
        → entity_history_arrival_path fires (source: entity-page)

Step 4: Session converts — subscribes to Score-Watch OR returns to the same entity
        page within 7 days (Umami session recurrence proxy)
```

**Measurement note:** Step 4 is not measurable with precision at current traffic. Use it as a directional check only: does any /history session contain a Score-Watch page navigation? At low volume, even 1-2 conversions per week traced to this funnel are meaningful.

**Decision gate:** If Step 2 → Step 3 conversion is below 50% (i.e., more than half of card clicks do not result in a history page load), the card is either navigating incorrectly, or the history page is returning 404s for some entities. Investigate before looking at Step 3 → Step 4.

---

### Funnel 2: Retention Validation (Tier D Check)

This funnel detects whether Tier D compaction is too aggressive — visitors who arrive on the history page, expand a hidden rollup, and then return to the entity page (suggesting the expanded content was decision-relevant).

```
Step 1: Session loads /entity/<slug>/history
        → entity_history_arrival_path fires

Step 2: Session expands a sub-threshold rollup
        → entity_sub_threshold_rollup_expanded fires

Step 3: Session navigates back to the entity page
        (Umami pageview sequence: /entity/<slug>/history → /entity/<slug> or equivalent)
```

**Interpretation:** Steps 1 → 2 → 3 completed in sequence = the visitor found the compacted content meaningful enough to expand and then returned to the primary entity context. This is a direct signal that Tier D is hiding research-relevant information. The threshold for Tier D revision is defined in Section 5.

---

## 4. Day-30 Success Targets

All metrics evaluated at weekly grain. Baselines marked as "unmeasurable today" because no entity evidence card exists and events are not yet instrumented.

| Metric | Baseline | Day-30 Target | Diagnostic if Missed |
|---|---|---|---|
| Evidence card click-through rate (`entity_evidence_card_clicked` / `entity_evidence_card_viewed` where `has_evidence: true`) | Unmeasurable today | ≥ 8% of impressions result in a click | Below 5%: card is invisible or below fold — UX-designer reviews placement. Below 8% but above 5%: copy or visual hierarchy issue — iterate card headline. |
| History page arrival from entity page (`entity_history_arrival_path` source=entity-page as % of all history arrivals) | Unmeasurable today | ≥ 40% of history page loads attributed to entity-page | If direct or search dominate: evidence card is not the primary driver; review card visibility before assuming success. |
| History page weekly sessions | Established by PR 2 (prior baseline); target not yet set at this spec date | ≥ 25% increase over PR-2 baseline weekly average | Flat after evidence card ships: card is not adding incremental discovery; check whether entity pages themselves have traffic. |
| Sub-threshold rollup expansion rate (`entity_sub_threshold_rollup_expanded` / sessions on /history pages with Tier D content) | Unmeasurable today | < 15% of eligible history sessions expand any rollup | Above 15%: Tier D is too aggressive; see Section 5 trigger. |
| Evidence card impression coverage (`entity_evidence_card_viewed` with `has_evidence: true` / total entity page views) | Unmeasurable today | ≥ 50% of entity page views show a populated evidence card | Below 30%: most entities have no scored history yet — expected at this archive age; monitor at day-60 as archive deepens. |

---

## 5. Retention-Policy Validation Metrics

These are the specific signals that would trigger a review of the four-tier content retention model.

**Tier D too aggressive — sub-threshold rollup expansion rate above threshold:**
If `entity_sub_threshold_rollup_expanded` fires in more than 15% of sessions that visit a history page with Tier D content present, compacted rollups are hiding content that visitors want. Action: promote the most-expanded rollup categories to Tier B (history-page visible), or raise the display threshold so fewer events qualify for compaction.

**Tier B not valuable — high history-page bounce rate:**
If sessions arriving on `/entity/<slug>/history` exit without interacting with any timeline event card (proxy: session duration under 30 seconds on the history page), Tier B content is not rewarding the click. Action: UX-designer reviews timeline card density and headline quality. If bounce rate exceeds 60% of history sessions, the history page may need a summary view before the full timeline.

**Tier C content undervalued — direct landings on `/updates/<date>` with high time-on-page:**
If sessions arriving directly on archive briefing pages spend over 180 seconds on page (per METRICS_ARCHIVE.md activation threshold of 90 seconds, doubled for conservative revision signal), Tier C content is generating genuine research engagement. If this pattern is consistent for specific entity-relevant briefings, consider promoting those entities' key briefing links to Tier B (surfaced directly on history pages with higher visual weight).

**Tier A content not rendering — methodology ruling impression rate near zero:**
If `entity_methodology_ruling_viewed` fires in fewer than 5% of history page sessions for entities that have ruling callouts, the always-visible Tier A content is either below the fold, visually indistinguishable from body text, or not being rendered on the entities that matter. Action: audit which entity types have ruling callouts and whether those entities are receiving history-page traffic at all.

**Archive-to-entity flow working backward — archive sessions navigating to entity pages:**
If Umami page sequence data shows sessions navigating from `/updates/archive` to entity pages but not from entity pages to history pages, Tier C content is doing discovery work that Tier A (the evidence card) should be doing. This means the evidence card may need stronger visual prominence on entity pages.

---

## 6. Privacy and Independence Policy

**Umami self-hosted confirmation:** Umami is self-hosted on the Compassion Benchmark VPS. No event data is transmitted to Umami's cloud or to any third-party analytics system. Search queries are never captured as strings — only character count is tracked. This is consistent with the privacy posture established in METRICS_ARCHIVE.md Section 7.

**No PII in any event payload.** All payload values are: public entity slugs, integer counts, integer day-durations, categorical strings from a fixed vocabulary. No user identifiers, no session tokens, no IP addresses at the Umami layer.

**Independence policy: no entity-level commercial signal to external systems.** The analytics record shows which entity pages receive traffic and which evidence cards are clicked, but this data lives only in the self-hosted Umami instance. No entity (Anthropic, 3M, Slovakia, etc.) receives or can access signals about their own engagement volume. The founding independence policy — entities do not pay for inclusion, score changes, or suppression — extends to analytics: entities do not receive behavioral intelligence about their own benchmark presence as a byproduct of site instrumentation.

**No third-party tracking pixels on entity pages.** No Google Analytics, no Meta Pixel, no Clarity. The Pagefind search index is built at compile time and runs entirely client-side; it does not transmit search queries to any external service.

---

## 7. Implementation Timing

### Phase 1 — Ship with the evidence card feature

Instrument these two events only:

- `entity_evidence_card_viewed` (impression; fires on page load)
- `entity_evidence_card_clicked` (interaction; fires on click)

These two events, with one week of data, are sufficient to answer the first critical question: is the card being seen and is it being clicked? No funnel wiring required yet.

Also instrument `entity_history_arrival_path` at this phase because it is a property of the existing `HistoryTimeline.tsx` component (note the `arrival_path` field already appears in the `entity_history_loaded` event in METRICS_ARCHIVE.md — align the new event name with the existing event or extend the existing event rather than creating a duplicate).

### Phase 2 — Two weeks after launch

Wire the following:

- `entity_sub_threshold_rollup_expanded` (required for retention-policy validation)
- `entity_methodology_ruling_viewed` (Intersection Observer; requires frontend implementation)
- Funnel 1 and Funnel 2 dashboard views in Umami custom reports
- Day-30 dashboard panel (evidence card CTR, history arrival path distribution, rollup expansion rate)

Do not instrument Phase 2 events before Phase 1 data confirms the card is rendering and generating clicks. Instrumentation before render confirmation is premature.

---

## 8. Diagnostic Loop Trigger

If day-30 targets are missed (specifically: evidence card CTR below 5% or history arrival rate from entity-page below 30%), the following investigation is dispatched:

**Meta-coordinator → retention tier review.** Pull `entity_sub_threshold_rollup_expanded` weekly totals. If expansion rate is above 15%, initiate a formal tier model revision: identify which event categories are being expanded most frequently and consider promoting them to Tier B. If expansion rate is below 5%, Tier D is working correctly — the miss is elsewhere.

**UX-designer → evidence card placement audit.** Review entity page layout to determine whether the evidence card is below the fold on mobile (375px). The evidence card must be visible without scrolling on at least the top 20 most-trafficked entity pages. If the card is below the fold, placement revision takes priority over copy or visual changes.

**Backend-engineer → event firing verification.** Confirm that `entity_evidence_card_viewed` is firing on entity pages where `has_evidence: true` by checking Umami event counts against the known count of entity pages that have at least one history event (derivable from `site/public/data/history/_manifest.json`). If event fire count is significantly below the expected entity page view count, the instrumentation is broken, not the card.

---

## Instrumentation Ambiguity Flags

**Flag A — Arrival path derivation for `entity_history_arrival_path`.** Same-origin SPA navigation in Next.js does not reload the document, so `document.referrer` will be empty for navigations from entity pages to history pages. The correct implementation is to pass a `from=entity-page` query parameter in the "View full assessment history" link from the entity detail page. Frontend engineer must implement this before Phase 1 ships — without it, the source attribution will be predominantly `direct` and the primary measurement objective (confirming the evidence card drives history traffic) will be unmeasurable.

**Flag B — Tier D event identification.** The `entity_sub_threshold_rollup_expanded` event requires knowing which timeline events qualify as Tier D (compactable). The criteria for Tier D compaction must be defined by the product/UX team before this event can be instrumented. The payload's `rollup_count` and `age_days` fields are meaningful only if the compaction criteria are stable and documented.

**Flag C — Existing `entity_history_loaded` event overlap.** METRICS_ARCHIVE.md already defines `entity_history_loaded` with an `arrival_path` property. The new `entity_history_arrival_path` event proposed here covers the same trigger. Before instrumentation, confirm whether to extend the existing event (add properties) or fire both. Firing both is wasteful and creates counting ambiguity. Recommendation: extend `entity_history_loaded` with any additional properties needed for evidence-card attribution rather than introducing a second event on the same trigger.
