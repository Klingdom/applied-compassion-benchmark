# /updates Page Redesign — Measurement Plan
**Date:** 2026-05-19  
**Scope:** /updates redesign instrumentation (additive to TrackedEntityLink)  
**Analytics platform:** Umami (existing `trackEvent` wrapper in `@/lib/analytics`)

---

## A. Three Measurement Questions (14-Day Window)

**Q1. Did the opening question change above-the-fold engagement?**  
Baseline: DailyQuestion was the closing element (position 12 of 13 in old DailyBriefing). In the redesign it moves near the top, before Signal Stack. Measure whether visitors who see the opening question dwell on it and click through at higher rates than the old closing position ever recorded. The signal is `updates.opening_question.view` impressions vs. `updates.opening_question.dwell_5s` completions. A dwell rate below 20% at top position means the question is not landing; above 40% justifies keeping it there.

**Q2. Did the new section order change scroll-depth distribution?**  
Old order placed Score Movements and Evidence Ledger deep in the page; the new order elevates Today's Analysis and the opening question. If the redesign is working, the scroll-depth mass should shift: 75% milestone should be reached by more sessions. Compare pre/post 75% milestone rate and track which sections generate the most exit events (sessions that stop scrolling). If Score Movements (now lower) still gets more 75%-milestone sessions than before, the order change is neutral; if Signal Stack and Today's Analysis now capture more dwell, the order is validated.

**Q3. Did per-card enrichment of Score Movements change click-through to entity profiles vs. evidence URLs?**  
ScoreMovementCard currently fires `updates_entity_click` with `source: "scoreMovement"` only on entity-name click. The card has no evidence URL link. If enrichment adds an evidence link, split traffic into two destination types — profile vs. external URL — and compute a ratio. The question is whether enriched cards pull readers deeper into evidence (external) or back into the entity profile (internal). A ratio of 60%+ going to external evidence would justify calling the enrichment "research-quality." Below 30% external means visitors still primarily use the card as a navigation shortcut to the profile, and enrichment has not changed the use pattern.

---

## B. Events to Instrument

All events use the existing `trackEvent(name, properties)` call in `@/lib/analytics`. None of the properties below constitute PII: entity slugs are public identifiers, source domains are public URLs, and position indices are ordinal integers. No user identifiers, emails, IP addresses, or session tokens are included in any event payload.

---

### B1. Opening Question Impression
**Event name:** `updates.opening_question.view`  
**Fires when:** The DailyQuestion component enters the viewport (Intersection Observer, threshold 0.5).  
**Properties:**  
- `date` — briefing date string (YYYY-MM-DD)  
- `has_linked_entity` — boolean, whether the question text contains a resolvable entity slug  
**PII-safe:** Yes.

---

### B2. Opening Question Dwell
**Event name:** `updates.opening_question.dwell_5s`  
**Fires when:** User remains in viewport of DailyQuestion for 5 continuous seconds after `view` fires.  
**Properties:**  
- `date` — briefing date string  
**PII-safe:** Yes. (5s dwell is a behavioral proxy, not identity.)

---

### B3. Section Impression (all major sections)
**Event name:** `updates.section.view`  
**Fires when:** Each named section container enters viewport (Intersection Observer, threshold 0.3, fires once per session per section).  
**Properties:**  
- `section` — one of: `opening_question`, `lead_signal`, `brutal_insight`, `high_compassion_contrast`, `signal_stack`, `score_movement_dashboard`, `boundary_watch`, `score_change_detail`, `failure_mode`, `methodology_innovation`, `evidence_ledger`, `today_analysis`, `sector_findings`, `risk_signals`, `subscribe_cta`, `purchase_cta`  
- `date` — briefing date string  
- `position` — integer ordinal of section in current page order (1-indexed), allowing detection if order is A/B tested later  
**PII-safe:** Yes.

---

### B4. Score Movement Card Click — with destination type
**Event name:** `updates.score_movement_card.click`  
**Fires when:** Any click on a link within a ScoreMovementCard (entity name link OR any evidence URL link added by enrichment).  
**Properties:**  
- `slug` — entity slug  
- `index` — entity index (e.g., `fortune-500`)  
- `destination_type` — `"profile"` (internal /company/* link) or `"evidence"` (external URL)  
- `destination_domain` — for `evidence` type: extracted domain of the evidence URL; for `profile` type: `"compassionbenchmark.com"`  
- `delta` — integer score delta on the card (allows filtering by magnitude)  
- `position` — ordinal position of this card in the ScoreMovementDashboard list  
**PII-safe:** Yes. Note: this is additive to the existing `updates_entity_click` fired by TrackedEntityLink (source: `"scoreMovement"`). The new event captures evidence-link clicks that TrackedEntityLink does not cover and adds the `destination_type` split.

---

### B5. Evidence Source Link Click
**Event name:** `updates.evidence_source.click`  
**Fires when:** User clicks any "Open" link in EvidenceLedger.  
**Properties:**  
- `source_domain` — extracted hostname (matches `row.domain` in EvidenceLedger)  
- `source_type` — one of `news`, `ngo`, `government`, `academic`, `legal`, `unknown` (matches `inferSourceType` output)  
- `entity_slug` — `row.entitySlug` if present, else empty string  
- `index` — `row.index` if present, else empty string  
- `position` — row ordinal in the ledger table (1-indexed)  
**PII-safe:** Yes.

---

### B6. Today's Analysis Bullet Click (if bullets become interactive)
**Event name:** `updates.today_analysis.bullet_click`  
**Fires when:** User clicks a bullet in the HighlightsSection (Today's Analysis block).  
**Properties:**  
- `position` — ordinal of bullet in list  
- `date` — briefing date string  
**PII-safe:** Yes. (Currently bullets are static text; if they become expandable or link to entities, add `slug` and `index` properties.)

---

### B7. Sector Finding Bullet Click
**Event name:** `updates.sector_finding.bullet_click`  
**Fires when:** User clicks a bullet inside SectorTrendsSection.  
**Properties:**  
- `sector` — sector label string  
- `position` — ordinal of bullet within sector  
- `date` — briefing date string  
**PII-safe:** Yes.

---

### B8. Risk Signal Expand
**Event name:** `updates.risk_signal.expand`  
**Fires when:** User expands a risk signal card (if expand/collapse interaction is added) or, if cards are static, when a risk signal entity link is clicked (distinct from the existing `updates_entity_click` via TrackedEntityLink source `"boundaryWatch"` which already fires — this event tracks card-level engagement, not entity navigation).  
**Properties:**  
- `position` — ordinal of the risk signal card  
- `has_affected_entities` — boolean  
- `timeframe_set` — boolean  
- `date` — briefing date string  
**PII-safe:** Yes.

---

### B9. Scroll-Depth Milestones
**Event name:** `updates.scroll_depth`  
**Fires when:** User scrolls past 25%, 50%, 75%, 100% of page height. Fires once per milestone per session.  
**Properties:**  
- `milestone` — integer: `25`, `50`, `75`, or `100`  
- `date` — briefing date string  
**PII-safe:** Yes. Implementation note: milestone percentages should be computed against `document.body.scrollHeight` minus `window.innerHeight`, sampled on `scroll` with a 200ms debounce.

---

### B10. Subscribe CTA Impression and Click
**Event name (impression):** `updates.subscribe_cta.view`  
**Event name (click):** `updates.subscribe_cta.click`  
**Fires when (view):** SubscribeCTA component enters viewport (Intersection Observer, threshold 0.5, once per session).  
**Fires when (click):** User clicks the subscribe button in SubscribeCTA.  
**Properties (both):**  
- `cta_position` — `"inline"` (mid-page SubscribeCTA component) or `"purchase_block"` (bottom Callout with Purchase Research / Certified Assessment / Advisory buttons)  
- `date` — briefing date string  
**PII-safe:** Yes.

---

## C. Conversion Funnel Definition

The funnel has three terminal conversions: newsletter signup, entity profile read, and Score-Watch purchase. All three are reachable from /updates under the new section order.

**Funnel entry:** Session arrives at `/updates` or `/updates/[date]`.

**Step 1 — Above-the-fold engagement:** User sees Header + LeadSignalCard + BrutalInsightCard + OpeningQuestion. Measured by `updates.section.view` for `lead_signal` and `opening_question`. Drop here = weak hook.

**Step 2 — Signal consumption:** User reaches Signal Stack and/or Today's Analysis (HighlightsSection). Measured by `updates.section.view` for `signal_stack` and `today_analysis`. This is the content-credibility gate: users who read signals are warmer for conversion.

**Step 3 — Entity navigation (profile conversion):** User clicks a TrackedEntityLink from any section (`scoreChanges`, `scoreMovement`, `topSignal`, `sectorAlert`, `leadSignal`, `signalStack`, etc.) → lands on entity detail page → entity profile pageview recorded. This is conversion path (b).

**Step 3 — Subscribe CTA impression (newsletter conversion):** User reaches SubscribeCTA section (mid-page). Measured by `updates.subscribe_cta.view`. Click → newsletter signup = conversion path (a). SubscribeCTA sits after Score Movements in the new order, meaning only users who scroll past Signal Stack, Today's Analysis, Score Movements, and Evidence Ledger will see it organically. If impression rate is below 15%, consider a sticky or earlier CTA.

**Step 3 — Score-Watch CTA (purchase conversion):** User navigates from /updates to an entity profile page via TrackedEntityLink, then clicks the Score-Watch CTA on the entity page. This is a two-step funnel: `updates_entity_click` (source = any briefing section) followed by `score_watch_click` on the entity page. The /updates redesign feeds this funnel but does not own the Score-Watch CTA itself. Measure: of entity profile sessions originating from `updates_entity_click`, what fraction produce a `score_watch_click`? This is the warm-visitor Score-Watch conversion rate, distinct from cold traffic.

**Funnel summary by section (new order):**

| Section | Role in funnel |
|---|---|
| Header + LeadSignal + BrutalInsight + OpeningQuestion | Hook — prevents immediate exit |
| Today's Analysis (HighlightsSection) | Credibility — editorial signal |
| Signal Stack | Breadth — entity discovery |
| Score Change Detail | Depth — high-intent entity navigation |
| Score Movements | Volume — broad entity navigation |
| Evidence Ledger | Trust — source verification, low conversion but high credibility |
| Sector Findings | Context — sector-level signal |
| Risk Signals | Forward intent — entity watch seeding |
| SubscribeCTA | Newsletter conversion gate |
| Purchase CTA (Callout) | Research purchase + advisory conversion gate |

---

## D. Per-Card Insight Metric — Score Movements Placement Test

**Decision being made:** Score Movements stays at the bottom of the new order unless per-card enrichment proves the cards are substantive enough to justify moving the section higher (e.g., between Signal Stack and Evidence Ledger).

**Test definition:** Measure `updates.score_movement_card.click` events with `destination_type = "evidence"` as a fraction of all `updates.score_movement_card.click` events (both profile and evidence combined), scoped to sessions where the ScoreMovementDashboard section was reached (i.e., `updates.section.view` section = `score_movement_dashboard` fired).

**Threshold:** If the evidence click-through rate among sessions that reached the section is **≥ 18% within 28 days** of enrichment launch, the cards are generating research behavior (not just entity navigation) and the section warrants moving up. Below 18% means visitors treat the cards as a scorecard summary, not as evidence-linked research entry points, and the bottom position is appropriate.

**Secondary check:** Card-level reach rate — what fraction of /updates sessions reach the ScoreMovementDashboard section at all (via `updates.section.view`)? If reach is below 25%, the content is effectively invisible at the bottom regardless of card quality. Both the evidence CTR threshold and the reach rate must be met before moving the section up.

**Concrete decision rule:**  
Move Score Movements up if, 28 days post-enrichment launch:
- Evidence click-through rate (evidence clicks / total card clicks, among sessions reaching section) is **≥ 18%**, AND
- Section reach rate (sessions with `updates.section.view` section=`score_movement_dashboard` / total /updates sessions) is **≥ 25%**.

If either criterion fails, keep Score Movements at the bottom and reconsider card content before retesting.

---

## E. Dashboard Sketch

Six to eight panels, grouped by funnel stage.

**Top-of-funnel — Impressions**

1. **Page reach by section** — bar chart, x-axis = section name, y-axis = % of /updates sessions that fired `updates.section.view` for each section. Shows which sections are actually being seen. Updated daily.

2. **Scroll-depth distribution** — stacked bar or funnel: % of sessions reaching 25/50/75/100% milestones. Primary indicator of whether the new order is drawing users deeper.

**Engagement — Dwell and Click**

3. **Opening question dwell rate** — single stat + 14-day trend: `updates.opening_question.dwell_5s` / `updates.opening_question.view`. Target reference line at 40%.

4. **Score Movement card engagement** — two-segment bar per briefing date: profile clicks vs. evidence clicks. Also shows total reach rate (section.view / total sessions). Drives the D section placement decision.

5. **Evidence ledger click-through by source type** — horizontal bar: source type (news / ngo / government / academic / legal) × click count. Shows whether credibility of the ledger varies by source category. Useful for editorial prioritization.

**Conversion**

6. **Entity profile sessions from /updates** — time series: daily count of entity detail pageviews where referrer or `updates_entity_click` event preceded the pageview, broken down by TrackedEntityLink source value (scoreChanges, scoreMovement, signalStack, leadSignal, etc.). Shows which briefing sections drive the most profile reads.

7. **Subscribe CTA funnel** — two-step bar: impression count vs. click count for `updates.subscribe_cta.view` and `updates.subscribe_cta.click`, split by `cta_position` (inline vs. purchase block). Gives newsletter conversion rate and bottom-of-page vs. mid-page CTA performance.

8. **Score-Watch warm-visitor conversion** — sessions from /updates that produced a `score_watch_click` on an entity page / total sessions from /updates that produced an entity page view. Trend over time. This is the revenue-critical panel.

---

## F. Privacy and Stability Note

**Privacy:** None of the proposed events collect user-identifying data. All properties are either public entity identifiers (slugs, index names), behavioral proxies (scroll milestones, dwell booleans, ordinal positions), or public domain names extracted from source URLs. No email addresses, session tokens, user IDs, or IP-derived attributes are present in any event payload. This is consistent with the existing `updates_entity_click` implementation in TrackedEntityLink. Gumroad and Listmonk hold all subscriber PII; the Umami event layer must never receive it.

**Event name stability:** The proposed event names use dot-notation namespacing (`updates.*`) that is consistent, extensible, and distinct from the existing flat-name convention (`updates_entity_click`). The dot-notation names should be treated as stable contracts: do not rename them after the first 14 days of data collection, as cohort and retention queries will reference them by exact string. The `section` property values in `updates.section.view` are the most likely to drift if sections are renamed in code — these must be defined as constants in a shared instrumentation file, not inlined as string literals in each component, so a section rename in the UI does not silently break the analytics without a deliberate property-value update.
