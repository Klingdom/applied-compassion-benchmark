# Analytics Review: Daily Briefing System
**Date:** 2026-05-13
**Scope:** KPIs, event instrumentation, conversion funnel, experiments, gaps

---

## Current State Summary

Umami is live (website ID `47fd034d-...`, proxied via `/u/script.js` through Nginx). Three
classes of events are already instrumented: entity clicks from the briefing
(`updates_entity_click`), newsletter subscriptions (`newsletter_subscribed`,
`newsletter_subscribe_error`), and purchase intent signals (`gumroad_click`,
`contact_sales_submitted`). The analytics helper (`site/src/lib/analytics.ts`) is
SSR-safe and fault-tolerant.

The gap is not in the plumbing. The gap is in what the briefing pages themselves
emit. The daily update page (`/updates/[date]/page.tsx`) is a static server
component. The `DailyBriefing` and `TopSignals` components carry no client-side
instrumentation beyond `TrackedEntityLink` clicks. Evidence-link clicks, section
engagement, scroll depth, forward-signal interactions, and methodology-rule
exposures produce zero events today.

---

## Top 5 KPIs

### KPI 1 — Briefing-Driven Newsletter Conversion Rate
**Definition:** `newsletter_subscribed` events where `source` contains `"briefing"` or
`"daily_update"` divided by unique sessions on `/updates/*` in the same period.
**Measurement window:** Weekly rolling.
**Why it matters:** The briefing is the top-of-funnel for the newsletter, which is the
top-of-funnel for research purchases. If this rate is below 2%, the briefing is
informing without converting.
**Current state:** Instrumented but the `source` tag on the newsletter embedded in
the daily update page passes `"unknown"` (the `NewsletterSignup` default). This KPI
cannot currently be separated from homepage signups.

### KPI 2 — Evidence-Link Click Rate (per briefing session)
**Definition:** `briefing_evidence_click` events per unique briefing page session.
**Target baseline:** Establish 30-day baseline before setting a threshold.
**Why it matters:** Evidence clicks are the single best proxy for "citation-quality
engagement." A journalist or researcher citing a briefing first reads the primary
sources. If evidence links are not being clicked, the briefing is being consumed as
a summary rather than as a benchmark record.
**Current state:** Not instrumented. Zero signal on this today.

### KPI 3 — Band-Crossing Briefing Sessions vs. Confirmation Briefing Sessions
**Definition:** Ratio of sessions on band-crossing cycles (where `bandChange: true`
exists in `scoreChanges`) to sessions on confirmation cycles (all confirmations, no
band changes).
**Why it matters:** If band-crossing cycles draw 3x the sessions, the briefing's
editorial signal is working — high-consequence events pull attention. If the ratio
is flat, the briefing has not yet differentiated itself for practitioners who
monitor specific entities.
**Current state:** Umami page views are captured automatically by date URL.
Differentiation between cycle types requires tagging the page view with cycle
metadata, which does not happen today.

### KPI 4 — Research Purchase Attribution to Briefing
**Definition:** `gumroad_click` events where the referring page is `/updates/*`,
divided by total `gumroad_click` events.
**Why it matters:** This directly measures whether the briefing is a commercial
conversion surface or purely an authority play. The commercial products
(`/research`, `/commercial-access`) must have a traceable path from briefing
engagement.
**Current state:** `gumroad_click` is instrumented via `Button.tsx`. Referrer context
is not attached to the event payload today, so briefing-attributed purchases cannot
be separated from homepage or research-page purchases.

### KPI 5 — Forward Signal Return Rate
**Definition:** Of sessions that viewed a briefing containing a forward signal (a
`signals` entry with a specific future date), what fraction returned to the site on
or within 2 days of that signal's date?
**Why it matters:** This is the cleanest behavioral measure of whether the briefing
creates intellectual commitments. A reader who came back to see if the Anthropic
May 15 trigger fired is a qualitatively different reader than a one-time visitor.
**Current state:** Not measurable today. Requires a session identifier (cookie or
localStorage) and a stored signal-date registry. Umami's session model supports
this if the forward signal date is stored client-side and used to fire a
`briefing_return_on_signal_date` event on subsequent visits.

---

## Event Instrumentation Plan

| Event name | Trigger | Required properties |
|---|---|---|
| `briefing_page_view` | Page load on `/updates/[date]` | `cycle_date`, `cycle_type` (band_crossing / material / confirmation), `band_crossing_count`, `entity_count`, `has_forward_signals` |
| `briefing_evidence_click` | Click on any evidence URL inside a confirmation or scoreChange card | `cycle_date`, `entity_slug`, `entity_index`, `source_domain`, `dimensions_affected` (array), `in_window` (bool) |
| `briefing_section_visible` | IntersectionObserver fires when section enters viewport (>50% visible) | `cycle_date`, `section` (top_signals / score_movements / confirmations / sector_trends / emerging_risks / highlights / newsletter), `position` (ordinal 1–7) |
| `briefing_entity_click` | Already fires as `updates_entity_click` — extend properties | ADD: `cycle_date`, `cycle_type`, `entity_band`, `delta` (number or null) |
| `briefing_forward_signal_view` | IntersectionObserver fires on a signal card that has a future date | `cycle_date`, `signal_entity_slug`, `signal_date`, `signal_priority` |
| `briefing_newsletter_signup` | Already fires as `newsletter_subscribed` — fix source tag | `source` must be `"briefing"`, ADD `cycle_date`, `cycle_type` |
| `briefing_archive_nav` | Click on a date nav tab at the top of the briefing | `from_date`, `to_date`, `direction` (older / newer) |
| `briefing_back_to_latest` | Click on "Back to latest" in the archive banner | `archive_date` |
| `briefing_research_click` | Click on any link to `/research` or `/commercial-access` from the briefing | `cycle_date`, `cycle_type`, `section_origin` |
| `methodology_rule_view` | When a methodology rule label (e.g. "methodology v1.2", "Day-3 Sustained-Conduct Rule") is rendered and enters viewport | `cycle_date`, `rule_label`, `rule_version` |
| `briefing_share_click` | Click on a share action (if/when added) | `cycle_date`, `share_target` (clipboard / twitter / linkedin) |

**Implementation note on static pages:** `DailyBriefing` and `TopSignals` are server
components. Events that depend on user interaction (clicks, scroll) must be in
`"use client"` sub-components. Sections already wrapped in `TrackedEntityLink` are
client-side. IntersectionObserver-based section tracking requires a new
`BriefingScrollTracker` client component that renders as a sibling of the static
sections and attaches observers by `id` (the sections already carry `id` attributes:
`#top-signals`, `#score-movements`, etc.).

**`cycle_type` derivation:** Compute at the page level from JSON properties:
- `band_crossing` — any `scoreChanges` entry has `bandChange: true`
- `material` — any `scoreChanges` entry has `|delta| >= 5` but no band crossing
- `confirmation` — `scoreChanges` is empty or all entries are confirmations

---

## Conversion Funnel Definition

```
Stage 1: Briefing discovery
  Page view on /updates/[date] or /updates
  Event: Umami automatic page view (no custom event needed)
  Denominator for all downstream rates

Stage 2: Engaged read
  Threshold: briefing_section_visible fired for >= 3 distinct sections
  This distinguishes a bounce from an actual reading session

Stage 3: Evidence engagement
  At least one briefing_evidence_click in the session
  These are the citation-quality readers

Stage 4: Newsletter conversion
  briefing_newsletter_signup (source="briefing") fires
  This is the primary top-of-funnel conversion goal

Stage 5: Research intent
  briefing_research_click OR gumroad_click from /updates/* referrer
  This is the commercial conversion signal

Stage 6: Purchase
  Gumroad handles final transaction; no server-side signal returns
  Proxy: gumroad_click with referrer=/updates/* treated as purchase intent
```

The funnel is linear in stages 1–4 and branches at stage 5. A reader can move
from stage 2 directly to stage 5 without subscribing (researcher or institutional
buyer who already has a newsletter equivalent). Both paths are valid; the KPI
tracks both separately.

**What you do not currently know:** Stages 2–5 are unmeasured. You know page views
exist (Umami automatic) and newsletter conversions exist (instrumented). Everything
between is dark.

---

## 3 High-Leverage Analytics Experiments (Next 30 Days)

### Experiment 1 — Newsletter source tag fix + briefing conversion baseline
**Hypothesis:** The briefing drives a meaningfully different newsletter conversion
rate than the homepage, but they are currently pooled in the same `unknown` bucket.
**Implementation:** Pass `source="briefing"` to `NewsletterSignup` in
`DateBriefingPage` and the `/updates` index page. This is a one-line change in
`page.tsx`. Also add `cycle_date` and `cycle_type` to the event payload.
**What you learn in 30 days:** Briefing CVR vs. site average. Whether band-crossing
cycles convert at a higher rate than confirmation cycles.
**Effort:** 30 minutes. No design change.

### Experiment 2 — Forward signal return measurement
**Hypothesis:** Readers who see a forward signal (e.g. "Anthropic May 15 trigger")
have a measurable return rate within 2 days of that date.
**Implementation:** On `briefing_forward_signal_view`, write the signal date to
`localStorage` (keyed by signal entity + date). On any subsequent page load within
the signal window, fire `briefing_return_on_signal_date` with the stored context.
**What you learn in 30 days:** Whether forward signals create behavioral commitments.
If return rate is above 15%, the pre-staging mechanic is working as an engagement
device and should be emphasized editorially. If near zero, the signals are being
read but not acted on — which is a content format question, not an analytics
question.
**Effort:** ~4 hours (new `SignalReturnTracker` client component + localStorage
read/write).

### Experiment 3 — Band-crossing vs. confirmation cycle session quality
**Hypothesis:** Band-crossing cycles attract higher-quality sessions (more sections
read, more evidence clicks, higher downstream conversion) than confirmation cycles.
**Implementation:** Add `cycle_type` to `briefing_page_view` and
`briefing_section_visible`. Segment Umami reports by this property.
**What you learn in 30 days:** Whether the editorial investment in material cycles
pays off in engagement. If confirmation cycles have the same depth as band-crossing
cycles, the briefing format is working uniformly — which is actually a strong
signal for authority building. If there is a clear gap, the format of confirmation
cycles should be redesigned to drive deeper engagement.
**Effort:** 2 hours (one new property on page view; `BriefingScrollTracker` client
component).

---

## The Single Biggest Analytics Gap

**The evidence-link click is unmeasured and it is the most important signal the
briefing produces.**

The product's authority claim rests on evidence. Every headline in the briefing
is backed by primary sources — OHCHR press releases, HRW reports, court filings,
CNBC reporting. The May 9 briefing alone contains 30+ distinct evidence URLs. The
May 4 briefing has 20+.

If those links are never clicked, the briefing is functioning as a summary service,
not a benchmark record. A summary service competes with Reuters and AP. A benchmark
record with evidence chains does not.

The gap is also unmeasurable retroactively. Umami does not capture outbound link
clicks by default. Every day that passes without instrumentation is a day of signal
lost.

**How to close it:** Add `onClick={() => trackEvent("briefing_evidence_click", {...})`
to every evidence `<a>` tag inside the briefing render. These tags are currently
plain `<a>` elements in server-rendered JSX. They need to become client-component
wrappers — the same pattern already used by `TrackedEntityLink`. A single
`TrackedEvidenceLink` component wrapping the existing anchor pattern handles all
cases. The required properties are: `cycle_date`, `entity_slug`, `source_domain`,
`dimensions_affected`, `in_window`.

This one instrumentation change would answer three standing strategic questions:
1. Are journalists and researchers following the primary sources? (authority signal)
2. Which entity findings attract the most evidence engagement? (editorial priority)
3. Is the `inWindow` distinction (recent vs. baseline evidence) noticed by readers?
(methodology communication signal)

---

## Specific Umami Events to Add

The following are net-new calls to `trackEvent` to add in priority order:

**Priority 1 (implement this week):**
- `briefing_page_view` with `cycle_type`, `cycle_date`, `band_crossing_count` —
  one call at the top of a `BriefingPageTracker` client component mounted in
  `DateBriefingPage`. Uses `useEffect` on mount.
- Fix `newsletter_subscribed` source tag: pass `source="briefing"` from
  `DateBriefingPage` to `NewsletterSignup`.

**Priority 2 (implement this sprint):**
- `briefing_evidence_click` — via a new `TrackedEvidenceLink` client component.
- `briefing_section_visible` — via `BriefingScrollTracker` using
  `IntersectionObserver` on the existing section `id` attributes.
- Extend `updates_entity_click` to include `cycle_date`, `cycle_type`,
  `entity_band`, `delta`.

**Priority 3 (implement next sprint):**
- `briefing_forward_signal_view` + `briefing_return_on_signal_date` —
  requires `SignalReturnTracker` component with localStorage.
- `briefing_research_click` — add `trackAs="briefing_research_click"` prop with
  `cycle_date` and `cycle_type` on any Button pointing to `/research` or
  `/commercial-access` inside `DailyBriefing`.
- `methodology_rule_view` — fire when a section containing a version string
  (e.g. "methodology v1.2") enters viewport.

---

## On Umami vs. PostHog

Stay on Umami. The argument for PostHog would be session replay, funnel
visualization, and cohort retention analysis — all valid for a SaaS product with
logged-in users. The Compassion Benchmark has no login, no persistent user
identity, and no server-side event source. PostHog's value-add requires user
identity to work; without it, PostHog is a more expensive and more complex Umami.

The forward-signal return measurement (Experiment 2) does require a session
identifier across visits, but this can be implemented with a first-party cookie or
localStorage key without PostHog. If in 90 days the briefing has 10,000+
sessions/month and the team wants true funnel cohort analysis, revisit. At current
scale, the marginal complexity of migrating to PostHog is not justified by the
measurement benefit.

---

## Independence Policy and Analytics

There is no analytics signal that currently distinguishes "entity-paid content"
from "independent assessment" — and correctly so, since entity payment for content
does not exist. The independence policy is structural, not behavioral.

The one analytics surface that could theoretically create a false impression is the
`gumroad_click` event: if an entity's name appears frequently in the briefing AND
the entity is also a commercial product purchaser (e.g. a company buys the Fortune
500 bundle), someone reviewing the analytics could draw a spurious connection. This
is not an analytics design problem — it is a transparency communication problem.
The correct response is a published policy statement, not an analytics suppression
rule.

If the site ever adds an "institutional access" tier where entities receive
early access to their own assessments, that tier would require a new event class
(`institutional_access_view`) with careful property design to ensure the entity
slug is never joined against the editorial assessment pipeline in a way that
suggests influence. That is a future design problem, not a current one.

---

## Cross-Cycle Narrative Reach

The Hungary arc (May 9 proposed → May 10 re-pinned → May 11 confirmed → May 11
applied → May 12 published) spans four briefings. There is no current mechanism
to measure the cumulative reach of that narrative.

A practical proxy that does not require new infrastructure: sum the Umami page
views for the four briefing dates weighted by entity prominence (lead finding vs.
confirmation vs. sector trend mention). This is a manual calculation today but
could be automated if the briefing JSON includes a `featured_entities` field with
prominence rankings.

The deeper cohort question — "did readers who saw the May 9 Hungary proposal return
to see the May 12 confirmation?" — is measurable only with the forward-signal
return mechanism from Experiment 2. The `signals` array in the May 9 JSON already
pre-stages the June 9 re-assessment. If that June 9 briefing fires `briefing_return_
on_signal_date` events, you will have your first cross-cycle behavioral data.

---

*File: `research/format-review/2026-05-13-analytics-review.md`*
