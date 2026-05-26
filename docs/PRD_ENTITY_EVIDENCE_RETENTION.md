# PRD: Entity-Page Evidence Traceability and Retention Policy

**Version:** 1.0
**Date:** 2026-05-26
**Owner:** Product
**Status:** Ready for architecture + engineering handoff
**Extends:** `docs/PRD_ARCHIVE.md` (the archive and per-entity history system)
**Downstream consumers:** system-architect, frontend-engineer, analytics

---

## 0. What already exists (baseline)

The entity page (`/country/turkey`, `/ai-lab/anthropic`, etc.) currently renders:

- Composite score, band, rank, and dimension bars (`EntityDetail.tsx` lines 65–563)
- A "Latest research update" card when a `latestChange` prop is present, showing the most recent scored event's date, delta, and headline — with a "View briefing" link to the date page (`EntityDetail.tsx` lines 297–347)
- An evidence-review freshness stamp from the overnight scanner (`EntityDetail.tsx` lines 146–174)
- A `historyHref` prop slot (line 119–128) that renders a "View score history →" link when populated
- A floor-designation disclosure when applicable (`EntityDetail.tsx` lines 181–295)

The per-entity history page (`/entity/[slug]/history`) exists as a PR 2 deliverable and shows a full chronological timeline of scored and boundary-watch events (`HistoryTimeline.tsx`). Each event card shows date, type badge, delta, new composite, headline, and a briefing link.

**What is missing:**

1. The entity page's "Latest research update" card shows only one event. There is no indication of how many score changes the entity has had, no summary of the evidence pattern, no methodology ruling callout, and no forward signal (what the benchmark is watching next).
2. There is no retention policy: sub-threshold movements, boundary-watch cycles, and scan-level records accumulate at the same visual weight in the history JSON. At day 41 this is manageable. At day 200 it creates noise for every visitor who wants to understand why an entity sits where it does.

---

## 1. Problem Statement

### The traceability gap

A visitor who lands on `/country/slovakia` today can see that Slovakia scores 31.6 in the Developing band. They cannot see — without navigating away — that this score reflects three distinct score changes over 18 days (May 7: -10.9, May 22: -5.5, May 25: -2.0) driven by a first-baseline Dismantler classification, a Liberties.eu institutional convergence, and a four-group European Parliament supermajority vote. They cannot see that a new Tier-1.5 methodology category (Ruling 5) was established in the same cycle that drove the most recent apply. This evidence exists in the system — it lives in `site/public/data/history/slovakia.json` and in the daily briefings — but none of it is surfaced from the entity page itself.

For Turkey, the situation is more acute: the history JSON (`turkey.json`) contains ten events across six days, including three consecutive scored applies totaling -7.4 points and four boundary-watch cycles. A journalist arriving on `/country/turkey` today sees only the most recent of those — the May 25 mass-protest documentation at delta 0 — and has no direct path to the arc that explains how Turkey reached 15.1.

For Anthropic, a visitor sees the current score of 58.1 but has no indication that it has been in a seven-cycle boundary-watch hold at the Functional/Established boundary for a week, pending a specific DC Circuit ruling, or that a band crossing was proposed at cycle 3 and has been deferred ever since.

The traceability gap is: evidence that explains the current score is one or two clicks away from the entity page, but visitors don't know it exists.

### The retention gap

The history JSON for Anthropic (`anthropic.json`) contains 21 events at day 41 of the research pipeline. Six of those are boundary-watch entries that are near-duplicates: each cycle records that the DC Circuit ruling is still pending and the language from May 19 oral arguments remains the most salient signal. These entries are institutionally important — they document that the benchmark actively monitored Anthropic for seven consecutive days — but they are informationally redundant after the first two cycles. A visitor reading all six learns nothing beyond what the first two convey.

Slovakia has four events and no redundancy problem today. At six months, if Slovakia receives similar monitoring cadence, it will have 60+ events. Most will be boundary-watch cycles or sub-threshold documentation that does not add new information once the accumulation context is established.

"Show everything forever" does not scale for two reasons:
1. Visual weight: at 60+ events, the first-time visitor cannot identify the three or four events that explain the current score.
2. Cognitive load: the difference between a -5.5 apply (May 22, Slovakia) and a "documented hold — no new threshold events" (May 23, Slovakia) is categorical. Treating them at the same visual weight misdirects the visitor's attention.

### What success looks like

A visitor researching an entity should be able to:
1. Understand the current score, the reason it sits there, and when it last moved — within 10 seconds of landing on the entity page, without clicking away.
2. Discover in one click a complete, chronological record of every event in the research pipeline for that entity.
3. Find any methodology rulings that affected that entity's score, without reading every daily briefing.
4. Know what the benchmark is actively watching (forward signal) if one exists.

---

## 2. User Stories

### Story 1 — Journalist landing on Slovakia

**As a journalist researching Slovakia**, I want to land on `/country/slovakia` and immediately see when the score last changed, what the delta was, and a one-sentence summary of the evidence — so I can decide in 10 seconds whether to investigate further.

**Acceptance criteria:**
- [ ] The entity page shows a "Recent score events" card with the last 1–3 scored events (type = `scored`, delta non-zero), displaying: date, delta, headline, and briefing link.
- [ ] The card prominently labels the most recent event as "Most recent score change."
- [ ] The card includes a "View full history (N events)" link to the `/entity/[slug]/history` page, where N is the total event count from the history JSON.
- [ ] If the entity has never had a scored non-zero event, no "Recent score events" card is rendered.
- [ ] The card is visible above the dimension bars, within the first screen of content.

---

### Story 2 — Investor evaluating Anthropic

**As an investor evaluating Anthropic**, I want to see any methodology rulings that directly affected Anthropic's score — without having to read 41 daily briefings — so I can understand whether the scoring reflects consistent methodology or ad hoc judgment.

**Acceptance criteria:**
- [ ] If one or more methodology rulings in the briefing record explicitly reference the entity's slug in a `topSignals` entry with `actionType = "documented"` and the title contains "Methodology" or "Ruling," a "Methodology rulings" callout is shown on the entity page.
- [ ] Each ruling entry shows: ruling date, ruling name (from `topSignals.title`), and a link to the full briefing.
- [ ] A visitor who sees this callout can click through to the specific briefing date for the full ruling description.
- [ ] The callout is absent when no methodology rulings reference the entity.
- [ ] The callout does NOT render for rulings that were established in relation to a different entity even if they have downstream applicability — scope to rulings directly linked to the entity's slug.

---

### Story 3 — Returning visitor checking Turkey

**As a returning visitor checking on Turkey**, I want to know at a glance whether anything happened since I last looked — so I don't have to re-read the full history to find out the status is unchanged.

**Acceptance criteria:**
- [ ] The entity page shows the date of the most recent research cycle that included this entity (from the `lastEventDate` field in the history JSON).
- [ ] If the most recent event has delta 0 (a hold), the card labels it explicitly as "Hold confirmed" with the date — not as a score change.
- [ ] If the entity is in an active boundary-watch cycle, the card shows a "Boundary watch active — cycle N" label with the current cycle number and a brief trigger summary (from the `boundaryWatch[].trigger` field in the relevant daily JSON).
- [ ] The boundary-watch status is distinct from a scored event; it does not inflate the "score change" count.

---

### Story 4 — Score-Watch subscriber who received an alert

**As a Score-Watch subscriber who received a Slovakia alert**, I want to land on the entity page from the alert email link and immediately find the prior score changes leading up to this one — so I have context for the alert without navigating through the archive.

**Acceptance criteria:**
- [ ] The "Recent score events" card shows up to 3 prior scored non-zero events, not just the most recent one.
- [ ] Events are ordered most recent first.
- [ ] Each event shows a "View briefing" link.
- [ ] The card links to the full history page for all events beyond the first 3.
- [ ] The most recent event score matches the score shown in the alert email (no staleness within a single build cycle).

---

### Story 5 — Researcher finding methodology rulings for the AI Labs sector

**As an AI safety analyst**, I want to find the methodology ruling that established how benchmark scores respond to boundary-watch holds — so I can evaluate whether Anthropic's seven-cycle hold was applied consistently.

**Acceptance criteria:**
- [ ] The Anthropic entity page shows any methodology rulings directly linked to its slug.
- [ ] Each ruling card links to the full briefing where the ruling was established.
- [ ] The ruling description (from `topSignals.description`) is not shown on the entity page in full — only the ruling name and date, to keep the entity page scannable. Full text is one click away.

---

## 3. Retention Classification

The policy below applies to evidence that accumulates in `site/public/data/history/<slug>.json` and in the daily briefings at `site/src/data/updates/daily/<date>.json`. It determines where evidence surfaces and what visual weight it carries.

---

### Tier A — Always visible on the entity page

**What qualifies:**
- The most recent 1–3 scored events with non-zero delta (score-change events)
- First-baseline assessment, if it is the only event
- Methodology rulings linked directly to this entity's slug (extracted from `topSignals` entries on briefing dates that match the entity)
- Active boundary-watch status, if the entity is currently in a watch cycle (cycle N > 1, no resolved event yet)

**Where it surfaces:** Directly on the entity page, above the dimension bars, in a dedicated "Recent activity" section.

**Visual prominence:** Full-visibility cards with date, delta (or "Hold" label), headline, and briefing link. Not collapsible in MVP.

**Does it expire:** No. Score-change cards remain until superseded by a newer event. A score-change event that is later followed by three newer events drops off the entity-page card (only 3 shown), but remains fully available on the history page.

**Source:** `site/public/data/history/<slug>.json` → `events[]` where `type = "scored"` and `abs(delta) > 0.01`, sorted by date descending, limited to 3.

**Independence policy note:** The evidence shown in these cards is sourced entirely from the research pipeline. No entity-facing copy suggests that purchasing Score-Watch or a research report will affect the evidence shown. The card's "View briefing" link goes to the research record, not to a commercial surface.

---

### Tier B — One click away (history timeline, `/entity/[slug]/history`)

**What qualifies:**
- All scored events, including holds (delta 0) and boundary-watch entries
- Sub-threshold movements (type not yet present in current history JSON structure — see Open Questions)
- Band-crossing-proposed entries
- All events with the full headline

**Where it surfaces:** The history page only, via the "View full history" link from the entity page.

**Visual prominence:** Full timeline, all events listed with equal card weight. Current implementation in `HistoryTimeline.tsx` is appropriate. Boundary-watch entries are visually distinguished by the TypeBadge component (lines 56–69), which already renders a distinct "Watch" badge.

**Does it expire:** No. The history timeline is the permanent research record. All events remain at full fidelity.

**Source:** `site/public/data/history/<slug>.json` → `events[]`, all entries.

---

### Tier C — Archive-only (daily briefings, `/updates/<date>`)

**What qualifies:**
- Full pipeline metadata (`pipeline.*` fields: `entitiesScanned`, `entitiesAssessed`, etc.)
- All `boundaryWatch[]` entries for entities not appearing in `topSignals` or `recentAssessments` with a scored event
- Full `topSignals[].description` text (truncated on entity pages; full text here)
- Sub-threshold accumulation context for entities not individually featured as top signals
- Scan-level integrity data (errors, cycle type, confirmation counts)

**Where it surfaces:** Only at `/updates/<date>`. Not surfaced on entity pages. Reachable from the "View briefing" links on Tier A cards, and from the archive landing (`/updates/archive`).

**Visual prominence:** The full briefing page layout. No reduction. This is the record.

**Does it expire:** No. Briefings are immutable once published (per `docs/ARCHITECTURE_ARCHIVE.md` section 10). Corrections become new briefings.

**Source:** `site/src/data/updates/daily/<date>.json`, full document.

---

### Tier D — Compacted after threshold (deferred, not in MVP)

**What qualifies for eventual compaction:**
- Consecutive boundary-watch cycles for the same entity where the `trigger` text is near-identical (e.g., Anthropic cycles 3–7 all reference the same pending DC Circuit ruling with no new information)
- Sub-threshold movement entries older than 60 days where no threshold event followed (i.e., the accumulation never resolved into a score change)

**Proposed compaction format:** Instead of listing seven identical watch cycles, the history timeline would collapse them: "7 boundary-watch cycles, May 20 – May 25, 2026 — DC Circuit ruling pending. No change." with a link to expand. The underlying data is never deleted — only the rendering collapses the repeated entries.

**Why deferred:** Compaction requires a rendering decision (client-side collapse vs. pre-aggregated data) and a threshold definition (what counts as "near-identical"). These are non-trivial and not necessary for MVP. The Anthropic history today has 21 events, of which 6 are redundant watch cycles — this is readable. At 60+ cycles the problem becomes urgent.

**Decision trigger:** Revisit Tier D when any single entity's history file exceeds 50 events, or when any boundary-watch series for a single trigger runs longer than 14 cycles.

**Source:** `site/public/data/history/<slug>.json`, computed from `events[]` where `type = "boundary-watch"` and consecutive entries share the same `trigger` value (or match within a defined similarity threshold).

---

## 4. Acceptance Criteria for MVP

The MVP delivers the traceability fix. Compaction (Tier D) is explicitly deferred.

### Must-have (ships together)

**4.1 — "Recent score events" card on the entity page**

- Reads from `site/public/data/history/<slug>.json` at build time via the same pattern used in `renderEntityPage.tsx`.
- Selects events where `type = "scored"` and `abs(delta) > 0.01`, sorted by date descending, limited to 3.
- Renders each as a compact row: date · delta badge · headline (truncated at 120 chars) · "View briefing" link.
- If zero qualifying events exist, the card is not rendered.
- If exactly one qualifying event exists and it is the first-baseline, the card labels it "First baseline" (matching the existing pattern in `EntityDetail.tsx` lines 323–330).
- The card includes a footer: "View full history (N events) →" linking to `/entity/[slug]/history` where N = total event count from `history.events.length`.

**4.2 — Boundary-watch status on the entity page**

- If the entity's most recent event in the history JSON has `type = "boundary-watch"`, the entity page shows a compact "Boundary watch active" banner below the hero score, indicating the direction (`upward` / `downward`), current cycle number, and trigger summary (first 140 chars of `trigger`).
- The banner links to the full history page for context.
- This banner is secondary to the score card — it does not replace it.
- If no boundary-watch event exists or the watch is resolved, the banner is not shown.

**4.3 — "View full history" link always present when history exists**

This already exists as `historyHref` prop in `EntityDetail.tsx` (line 36 and lines 119–128). MVP confirms it is populated correctly for all entities with at least one event — including entities whose only events are holds (delta 0). The `historyHref` is currently the only traceability link; the "Recent score events" card adds richer context but the `historyHref` link in the hero must remain.

**4.4 — Methodology ruling callout (conditional)**

- At build time, scan the briefing record for `topSignals[]` entries where `slug` matches the entity and the `title` contains "Methodology" or "Ruling" (case-insensitive).
- If one or more such entries exist, render a "Methodology rulings" callout on the entity page listing: ruling date, ruling title (truncated at 80 chars), and briefing link.
- Maximum 3 entries shown; if more exist, show "View all rulings in history →" linking to the history page.
- This callout is absent for the vast majority of entities. It is primarily relevant for entities like Slovakia (Ruling 5 established May 25) and Turkey (boundary-assessment doctrine established May 23–25).

### Explicitly not in MVP

- Sub-threshold rollup UI (Tier D compaction)
- Forward signal display beyond what exists in the boundary-watch banner
- Cross-entity evidence linking ("Slovakia and Hungary share Ruling 5")
- Per-event authorial commentary beyond what is already in `events[].headline`
- Any modification to the history timeline layout in `HistoryTimeline.tsx` — the timeline is already correct for its purpose

---

## 5. Out-of-Scope Non-Goals

These are explicitly excluded from this PRD. Any proposal to add these must be scoped separately.

1. **Sub-threshold rollup UI.** Compacting redundant boundary-watch cycles or sub-threshold movements into summary rows is Tier D and deferred. No UI for this in MVP.

2. **Per-event commentary authoring.** The evidence on entity pages comes from the research pipeline, not from human authoring of entity-specific copy. No CMS, no editorial interface.

3. **Cross-entity evidence linking.** "Slovakia and Hungary share Ruling 5" or "Turkey and Belarus share the judicial-removal event type" — this requires a graph linking events by ruling or event-type. Not in MVP. The ruling callout (4.4) is entity-scoped only.

4. **Evidence tier labeling visible to visitors.** The Tier A / B / C / D model is an internal retention and routing framework, not a visitor-facing classification. Entity pages do not display "Tier 1" labels.

5. **Paid or gated evidence tiers.** Per the independence policy in `CLAUDE.md`: the research record is public. Evidence traceability is free. No paywall on any evidence surface.

6. **Real-time evidence updates.** Entity pages reflect the most recent build. Same constraint as the rest of the static site.

7. **Back-fill of sub-threshold movements into the history JSON.** Sub-threshold data currently lives only in the `summary` and `topSignals` fields of daily briefings. Extracting it into per-entity history requires a pipeline change and a schema addition. This is a separate engineering task, not a product requirement for this MVP.

---

## 6. Risks

### 6.1 — Page crowding

The entity page already renders: hero, evidence-review stamp, floor-designation (conditional), latest-change card, dimension bars, Score-Watch CTA, badge widget, full-dataset CTA, and newsletter signup. Adding a "Recent score events" card, a methodology ruling callout, and a boundary-watch banner could push the dimension bars below the fold on mobile.

**Mitigation:** The "Recent score events" card replaces the existing "Latest research update" card (lines 297–347 of `EntityDetail.tsx`) rather than adding alongside it. The existing card shows one event; the new card shows up to three. Net addition is at most two rows of content. The methodology ruling callout is conditional and absent for the vast majority of entities — it only appears when methodology rulings are directly linked to the slug, which as of day 41 affects a handful of entities. The boundary-watch banner is a single compact row.

**Acceptance criterion for crowding:** The dimension bars must remain visible within the first 2 full scrolls on a standard mobile viewport (375px width, 667px height) on the most information-dense entity page (Turkey, which would trigger the most cards simultaneously).

### 6.2 — Independence policy: evidence presentation must not create commercial pressure

The Score-Watch CTA on the entity page (`EntityDetail.tsx` lines 416–486) already sits below the evidence section. The risk is that a highly visible recent-score-events card (showing, for example, three consecutive applies on Turkey) could appear designed to alarm visitors into purchasing Score-Watch alerts — blurring the line between research disclosure and commercial pressure.

**Mitigation:** The "Recent score events" card must be styled and positioned as a research disclosure, not as a threat indicator. Specific rules:

- The card section heading must say "Assessment record" or "Recent assessments" — not "Alerts," "Risk events," or "Warning."
- Delta badges use the existing neutral color scheme (orange for downward, green for upward) matching the band colors — not red alert colors.
- The Score-Watch CTA must remain in its current position below the dimension bars, not adjacent to the evidence card.
- No copy on the evidence card references Score-Watch or any commercial product.

This mirrors the independence policy in `docs/ARCHITECTURE_ARCHIVE.md` section 0: "no entity-paid features and no per-entity sponsorship." Evidence is surfaced because it helps the visitor understand the score — not to create urgency for a purchase.

### 6.3 — Cache invalidation: entity pages must rebuild when new evidence lands

Entity pages are static. The "Recent score events" card reads from `site/public/data/history/<slug>.json`, which is regenerated by `build-entity-history.mjs` (from `ARCHITECTURE_ARCHIVE.md` section 2) on every build. The entity page itself must also rebuild when the history file changes.

**Current build behavior:** Entity pages are generated from data in `site/src/data/indexes/`. They do not currently depend on `site/public/data/history/`. Adding the recent-events card creates a new dependency: the entity page's data now requires the history file.

**Risk:** If the build pipeline does not import history data at page-generation time, entity pages could render stale evidence cards (the previous build's most recent event, not the new one).

**This is an architectural decision, not a product decision.** The architect must specify: whether the history JSON is imported directly at entity-page build time (same as how `renderEntityPage.tsx` currently imports score data from `site/src/data/indexes/`), or whether the entity page fetches the history file at build time from `site/public/data/history/<slug>.json`. Both are viable under static export. The product requirement is simply: the evidence card must reflect the same build cycle as the entity score.

### 6.4 — Methodology ruling extraction requires parsing signal titles

The methodology ruling callout (4.4) relies on scanning `topSignals[].title` for "Methodology" or "Ruling" text. This is a heuristic, not a structured field. If future briefings label rulings differently, the extraction may miss them.

**Acceptable risk for MVP:** The current five rulings (Rulings 1–5) are all titled with "Methodology" in the topSignal title (confirmed in the May 25 briefing, line 72). A more robust solution would add a `type: "methodology-ruling"` field to `topSignals[]` entries — but that is a pipeline change, not a product requirement for the current MVP. Flag this as a schema improvement for the next pipeline update.

---

## 7. Success Metrics

Traffic is currently low and session data is sparse. All targets are weekly-grain to reflect realistic volume.

| Metric | Baseline (today) | Target (8 weeks post-launch) | Measurement |
|---|---|---|---|
| % of entity-page sessions that click through to `/entity/[slug]/history` within the session | Near 0% (history link exists but is minimal — a single text link at line 119) | ≥ 8% of entity-page sessions that have a history card visible | Umami: click events on "View full history" link from entity pages |
| % of entity-page sessions that click "View briefing" from the recent-events card | 0% (single link currently exists but without multi-event context) | ≥ 5% of entity-page sessions | Umami: click events on briefing links within the evidence card |
| Bounce rate on entity pages where the recent-events card is present | No clean baseline | Target: no regression vs. current entity-page bounce rate | Umami: session exit rate on entity detail pages |
| Methodology ruling callout impressions | 0 (does not exist) | Not a primary metric — few entities qualify | Count of page loads where the ruling callout rendered (Umami page property) |

**Leading indicator (first 2 weeks post-launch):** Manual QA confirmation that Turkey, Slovakia, and Anthropic entity pages all render the correct most-recent events without stale data, and that at least one entity's methodology ruling callout renders correctly on first deploy.

**Post-launch metric (3-month horizon):** If the archive PRD's target of ≥ 200 unique entity history page views per month is tracked, the evidence card's "View full history" link is a primary driver of that number. The two features should be measured together.

---

## 8. Assumptions Flagged

**A1:** The `renderEntityPage.tsx` component (which generates all entity pages) can be extended to import `site/public/data/history/<slug>.json` at build time. This is assumed to follow the same pattern as `export-public-data.mjs` and `entityChanges.ts`. If the entity page build cannot read from `public/data/` at generation time, the architect must specify an alternative data-import path.

**A2:** The history JSON schema (`EntityHistory` type in `HistoryTimeline.tsx` line 7) is stable and complete as of this writing. In particular, `events[].type`, `events[].delta`, `events[].headline`, `events[].briefingPath`, and `events[].status` are assumed to be present and reliably populated. The Anthropic history shows some early entries (Apr 28–30) with `headline: "Anthropic"` and null `newComposite` — these are legacy entries from the early pipeline. The evidence card must handle null or stub headlines gracefully.

**A3:** Methodology ruling detection via `topSignals[].title` heuristic is acceptable for MVP. A structured `type: "methodology-ruling"` field in `topSignals` is the long-term solution but is not required before MVP launch.

**A4:** The independence policy constraint in this PRD (risk 6.2) is consistent with the constraint in `CLAUDE.md` and `ARCHITECTURE_ARCHIVE.md`. Any implementation that places the evidence card adjacent to the Score-Watch CTA, or uses alarm-oriented visual language, violates this constraint and must be revised before launch.

**A5:** "Sub-threshold movement" events are not yet in the history JSON schema (the current `events[].type` values are `scored` and `boundary-watch`). This PRD does not require sub-threshold data on entity pages or in the history timeline for MVP. If the pipeline adds sub-threshold events to the history JSON in a future build, the history timeline will render them by default via the `TimelineEventCard` component; they will not appear in the entity-page recent-events card (which filters to `abs(delta) > 0.01`).

---

## 9. Handoff Checklist

Before implementation begins, confirm:

- [ ] Architect resolves: how does `renderEntityPage.tsx` import history data at build time? (See risk 6.3 and A1)
- [ ] Architect resolves: does the "Recent score events" card read from the pre-built `public/data/history/<slug>.json` or from a new build-time import of the raw daily JSONs?
- [ ] Frontend engineer confirms: the existing `latestChange` / "Latest research update" card (lines 297–347 of `EntityDetail.tsx`) is replaced by the new multi-event "Recent score events" card — not added alongside it
- [ ] Frontend engineer confirms: boundary-watch banner is rendered only when the most recent event in the history is a `boundary-watch` type with an unresolved trigger
- [ ] Product confirms: methodology ruling callout heuristic (`topSignals[].title` contains "Methodology" or "Ruling") correctly identifies all five current rulings and no false positives
- [ ] Design confirms: delta badges, section heading copy, and card placement comply with independence policy (risk 6.2) before any visual review
- [ ] Analytics: Umami click events defined for `history_card_click`, `briefing_link_click_from_entity`, and `methodology_ruling_click`
