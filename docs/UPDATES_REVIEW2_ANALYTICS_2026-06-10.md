# /updates Engagement + Content-Performance Measurement — Second-Round Review
**Date:** 2026-06-10
**Scope:** Wave B shipped baseline. Engagement, daily-habit, and editorial feedback loop instrumentation only. Does NOT re-propose Gumroad attribution or purchase_confirmed wiring (handled in previous review).

---

## (a) Current measurable-vs-blind map

### What is currently measurable on /updates

| Surface | Instrumented | Event / Data source |
|---|---|---|
| Entity link clicks inside a briefing | YES | `updates_entity_click` via `TrackedEntityLink` — `slug`, `index`, `source` props distinguish 14 briefing contexts (leadSignal, scoreChanges, sectorAlert, openingQuestion, etc.) |
| Newsletter subscription from SubscribeCTA | YES | `newsletter_subscribed { source: "updates-subscribe-cta", variant: "inline" }` — fires on success; `newsletter_subscribe_error` on failure |
| Page view per briefing date | YES | Umami automatic page view on `/updates/[date]` |
| Archive page view | YES | Umami automatic page view on `/updates/archive` |
| Feed subscription (RSS/JSON) | PARTIAL | Server request logs show `/updates/feed.xml` and `/updates/feed.json` fetches, but Umami cannot distinguish a feed reader poll from a manual browser visit; no subscriber count is available |

### What is currently blind — the engagement layer

| Blind spot | Why it matters | File evidence |
|---|---|---|
| Reading depth / scroll completion | `ReadingProgress` at `site/src/components/updates/briefing/ReadingProgress.tsx` maintains a live percentage but calls no `trackEvent` at any threshold. The team has no signal distinguishing a visitor who read 10% from one who read 100%. | `ReadingProgress.tsx:16–47` — only `setProgress(pct)`, no analytics call |
| Jump-nav section clicks | `BriefingJumpNav` at `site/src/components/updates/briefing/BriefingJumpNav.tsx` renders chip `<a href="#id">` links. No `onClick` tracking fires. The team cannot tell which sections users navigate to directly, so there is no evidence of which sections drive section-level engagement. | `BriefingJumpNav.tsx:92–110` — plain `<a>` elements, no handler |
| Copy-citation clicks | `StatOfTheDay` at `site/src/components/updates/briefing/StatOfTheDay.tsx:32–38` copies a formatted citation string to clipboard. `handleCopy()` contains no `trackEvent` call. This is the primary "share" micro-action in the briefing and it is completely dark. | `StatOfTheDay.tsx:32–38` — `handleCopy` has no analytics call |
| Audit trail expand | `DailyBriefing.tsx:331–404` renders a native `<details>` element for the audit trail. No `ontoggle` listener is attached. The team cannot tell whether methodologically-engaged users are reading it. | `DailyBriefing.tsx:334` — bare `<details>`, no toggle tracking |
| Completion block render / scroll-to | `CompletionBlock` at `site/src/components/updates/briefing/CompletionBlock.tsx` has no `useEffect`-on-mount or IntersectionObserver. No event fires when a user reaches the end of the briefing. This is the natural "read to completion" signal. | `CompletionBlock.tsx` — pure server component, no client event |
| Archive engagement (row expand / "Read full briefing" clicks) | `ArchiveList.tsx:66–227` tracks row expand state (`useState(false)`) but fires no analytics event on expand or on "Read full briefing" link click. The team cannot tell which briefings attract archive interest. | `ArchiveList.tsx:69` — `toggle` callback, no `trackEvent` call |
| Archive filter usage | `ArchiveList.tsx:526–641` has sector filter, month filter, entity text filter, and sort mode controls. None call `trackEvent`. The team cannot tell which filter combinations are used, which entities are searched, or which sort mode is preferred. | `ArchiveList.tsx:563–567` — `handleClearAll`, `onSectorChange`, etc., no analytics calls |
| Daily-return / habitual reader signal | Umami records page views but no user-level session continuity exists (privacy-respecting design). No `localStorage` read-state is written when a briefing is fully read. There is therefore no client-side signal distinguishing a first-time visitor from a daily returner. | No `localStorage` write in any briefing component |
| Briefing → Score-Watch conversion path | `SubscribeCTA` passes `source="updates-subscribe-cta"` to `NewsletterSignup`, so newsletter signups from the briefing ARE tagged. However, no event fires for the "Purchase Research" CTA Callout at `DailyBriefing.tsx:418–432`, and no `score_watch_click` event fires from any briefing-specific entity link. The path from briefing engagement to paid conversion is not segmented. | `DailyBriefing.tsx:418–432` — `Button` elements without `trackAs` |
| Feed-reader subscriber count | The RSS/JSON feeds are static files; there is no read count or subscriber signal from Nginx logs that Umami aggregates. Subscriber growth via feeds is structurally unobservable at the current instrumentation level. | `site/public/updates/feed.xml` — static; no server-side request tracking |

---

## (b) Five candidates

---

### Candidate 1 — Scroll-depth milestones: "briefing_read_depth"

**Type:** Fix (missing instrumentation on a shipped UI element)

**Problem:** `ReadingProgress.tsx:16–47` computes scroll percentage on every scroll event but emits no analytics event at any threshold. The team cannot distinguish a bounce (0–10%) from a partial read (25–50%) from a full read (90%+). This is the single most important engagement signal for a long-form daily briefing format — without it, average session duration in Umami is the only proxy, and that is confounded by users leaving a tab open.

**Proposed change:** In `ReadingProgress.tsx`, add a `useRef<Set<number>>` to track which depth milestones have fired. Fire `trackEvent("briefing_read_depth", { pct: milestone, date: props.date })` at 25%, 50%, 75%, and 90% — each fires once per page load. Pass `date` as a prop from the parent `DailyBriefing` component. The `pct: 90` milestone is the "completion" signal.

Events created:
- `briefing_read_depth { pct: 25 | 50 | 75 | 90, date: "YYYY-MM-DD" }`

**Decision this informs:** (1) Is the average reader reaching the editorial synthesis cluster (scroll ~40%) or dropping in the lead-signal section? (2) Do briefings with band crossings retain readers to 75% more than briefings with only sub-threshold movements? (3) What is the actual completion rate, as an input to editorial length decisions?

**Independence-policy check:** No entity scores are attached to this event. No commercial intent signal is in the payload. Clean.

| Dimension | Score (1–5) |
|---|---|
| Impact | 5 |
| Strategic Alignment | 4 |
| Learning Value | 5 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **5+4+5+5−2−1 = 16** |

---

### Candidate 2 — Copy-citation click: "briefing_citation_copied"

**Type:** Fix (missing instrumentation on a shipped UI element)

**Problem:** `StatOfTheDay.tsx:32–38` runs `navigator.clipboard.writeText(citation)` but the `handleCopy` function contains no `trackEvent` call. Copy-citation is the highest-intent "share" action in the briefing — a user who copies the citation is actively deploying the finding externally (in a report, social post, or presentation). The team has no evidence of how often this happens or which briefing dates drive it.

**Proposed change:** In `StatOfTheDay.tsx:handleCopy`, after the `setCopied(true)` call, add `trackEvent("briefing_citation_copied", { date: props.date, stat_label: stat.label, entity: stat.entity ?? null })`. All three props are already in scope.

Events created:
- `briefing_citation_copied { date: "YYYY-MM-DD", stat_label: string, entity: string | null }`

**Decision this informs:** (1) Which dates and which stat types generate citation behavior? (2) Is citation frequency correlated with the entity sector (AI lab stats more shareable than country stats)? (3) Does citation behavior correlate with RSS subscriber growth in the following 7 days, suggesting an external-amplification → new-reader loop?

**Independence-policy check:** Tracks only that a citation was copied, not by whom. `stat_label` and `entity` fields are already public data displayed on the page. No user identity attached. Clean.

| Dimension | Score (1–5) |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **4+5+4+5−1−1 = 16** |

---

### Candidate 3 — Section-nav click tracking: "briefing_section_nav"

**Type:** Improvement (adds instrumentation to a shipped but untracked navigation element)

**Problem:** `BriefingJumpNav.tsx:92–110` renders one chip per present section using plain `<a href="#id">` anchor elements. No `onClick` fires. The team cannot tell which sections users navigate to, which means the `presentSections` computation (already server-side gated per briefing content) provides no feedback loop to the editorial agent about which sections get intentional navigation vs. passive scroll-through.

**Proposed change:** Add an `onClick` handler to each chip `<a>` element: `onClick={() => trackEvent("briefing_section_nav", { section_id: id, section_label: label, date: briefingDate })}`. Pass `briefingDate` as a prop to `BriefingJumpNav` from `DailyBriefing` (one additional prop on an existing interface).

Events created:
- `briefing_section_nav { section_id: string, section_label: string, date: "YYYY-MM-DD" }`

**Decision this informs:** (1) Which sections attract intentional navigation (users clicking directly to "Score movements" vs. "Evidence")? High nav frequency on a section = high interest, low scroll depth to that section = users are jumping there specifically. (2) Does the audit trail section see any direct navigation, or is it only reached by scrollers? If `section_id: "audit-trail"` has zero nav clicks, the collapsible placement decision is confirmed. (3) Editorial feedback to the digest agent: if "Boundary watch" consistently gets navigated to before "Signals", editorial order should shift.

**Independence-policy check:** `section_id` and `section_label` are display labels, not score data. No commercial information in the payload. Clean.

| Dimension | Score (1–5) |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **4+4+5+4−2−1 = 14** |

---

### Candidate 4 — Archive row engagement: "archive_briefing_expanded" + "archive_briefing_opened"

**Type:** Improvement (adds instrumentation to a shipped but untracked archive surface)

**Problem:** `ArchiveList.tsx:69` calls `toggle()` which updates `expanded` state but calls no `trackEvent`. The "Read full briefing" link at `ArchiveList.tsx:212–220` is a plain `<Link>` with no tracking. The archive page is structurally important for habitual readers (who return to it to navigate), but the team currently sees only the `/updates/archive` page view in Umami — not which briefings attract attention in the archive, which filter combinations are used to find them, or whether archive visitors convert to full-briefing reads.

**Proposed change:**
1. In `ArchiveRow.toggle()`, add `trackEvent("archive_briefing_expanded", { date: entry.date, score_changes: entry.scoreChanges, has_methodology_ruling: entry.hasMethodologyRuling })`.
2. On the "Read full briefing" `<Link>` at `ArchiveList.tsx:212`, add `onClick={() => trackEvent("archive_briefing_opened", { date: entry.date, entry_point: "archive-expand-preview" })}`.
3. On the archive filter changes (`onSectorChange`, `onMonthChange`, `onEntityChange`), add `trackEvent("archive_filter_applied", { filter_type: "sector"|"month"|"entity", value: string })`.

Events created:
- `archive_briefing_expanded { date, score_changes, has_methodology_ruling }`
- `archive_briefing_opened { date, entry_point }`
- `archive_filter_applied { filter_type, value }`

**Decision this informs:** (1) Which briefings attract archive curiosity (expanded but not necessarily opened)? High expand-to-open ratio on band-crossing briefings vs. sub-threshold briefings gives signal on which content types sustain archive interest. (2) Which sectors are most searched in the archive filter — this directly informs the digest agent about which entity sectors have the most engaged readers. (3) Archive usage pattern: are habitual readers using archive as a navigation surface (many brief expands, few opens) or a research surface (entity filter + full opens)?

**Independence-policy check:** `score_changes` count and `has_methodology_ruling` are aggregate content metadata already displayed in the archive row. No entity-level score data in the payload. Clean.

| Dimension | Score (1–5) |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **3+4+5+4−2−1 = 13** |

---

### Candidate 5 — localStorage read-state for daily-habit proxy: "briefing_returned"

**Type:** Experiment (new pattern, no shipped equivalent)

**Problem:** No component writes any per-briefing read state to `localStorage`. Umami page views cannot distinguish a first-time visitor from a reader who has read the last 14 consecutive briefings. The team therefore has no direct daily-habit or return-cohort signal for /updates. The existing `newsletter_subscribed` signal is a downstream conversion metric, not a leading behavioral indicator of habituation. Without a habit signal, the editorial feedback loop has no way to know whether engagement improvements are building toward DAU growth or merely attracting one-time visitors.

**Proposed change:** In `ReadingProgress.tsx`, when the `pct: 90` milestone fires (i.e., the user has reached deep read), write `localStorage.setItem("cb_last_read", props.date)`. On mount of any `/updates/[date]` page (a `useEffect` in a thin client wrapper), read `cb_last_read`. If it contains a date that is adjacent to the current briefing date (i.e., the last-read date is within the past 3 calendar days), fire `trackEvent("briefing_returned", { days_since_last: N, streak_signal: "adjacent" | "gap" })`. This is a privacy-respecting proxy — no user identity, no cookie, and the user can clear it by clearing local storage. The `streak_signal` property distinguishes adjacent-day readers (habit-forming) from gap returners (interest spikes).

Events created:
- `briefing_returned { days_since_last: number, streak_signal: "adjacent" | "gap" }`

**Decision this informs:** (1) Is /updates building daily-habit behavior? The ratio of `briefing_returned { streak_signal: "adjacent" }` to total daily briefing page views is the closest approximation to a DAU/MAU retention ratio available within the privacy and static-export constraints. (2) Do readers who return on consecutive days have higher `briefing_citation_copied` rates and higher `newsletter_subscribed` rates? If so, habit-building directly feeds the conversion funnel. (3) At what editorial pattern do readers break the habit (a gap day follows a structurally different briefing)? This gives the digest agent a churn signal.

**Dependency note:** This candidate depends on Candidate 1 (`briefing_read_depth`) being implemented first, since the `pct: 90` event is the "earn the write" trigger. Implementing Candidate 5 without Candidate 1 would require duplicating the scroll-depth logic.

**Independence-policy check:** `localStorage` key stores only the date of the last-read briefing — no email, no identity, no score data. The event payload contains only an integer day-delta and a two-value categorical. Complies with the no-third-party-sharing policy stated in `SubscribeCTA.tsx` and `NewsletterSignup.tsx`. The user can clear their own state at any time.

| Dimension | Score (1–5) |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 2 |
| **Priority** | **5+5+5+3−3−2 = 13** |

---

## Candidate ranked summary

| Priority | Candidate | Priority score |
|---|---|---|
| 1 (tie) | Scroll-depth milestones — `briefing_read_depth` | 16 |
| 1 (tie) | Copy-citation click — `briefing_citation_copied` | 16 |
| 3 | Section-nav click — `briefing_section_nav` | 14 |
| 4 | Archive row engagement — `archive_briefing_expanded` + `archive_briefing_opened` | 13 |
| 5 (tie) | localStorage daily-habit proxy — `briefing_returned` | 13 |

---

## Editorial feedback loop: connecting instrumentation to the digest agent

Once Candidates 1, 2, and 3 are live, the following query against Umami constitutes the minimal editorial feedback loop:

**Weekly query:** For each date in the past 14 days:
1. `briefing_read_depth { pct: 75 }` count / total briefing page views for that date = "deep read rate" per briefing
2. `briefing_section_nav` counts by `section_id` = section gravity ranking
3. `briefing_citation_copied` count by `entity` = most-cited entity types

A digest agent receiving these three numbers per briefing cycle can adjust:
- Content ordering: sections with high direct-nav gravity should move earlier
- StatOfTheDay selection: entity types that generate citation behavior should be prioritized
- Briefing length: dates with <30% reaching `pct: 75` warrant shorter structure

This requires no additional infrastructure — Umami's built-in event property filtering is sufficient for the queries. The editorial feedback does not require automation; a manual weekly Umami export shared with the digest agent prompt is adequate for the first 90 days.
