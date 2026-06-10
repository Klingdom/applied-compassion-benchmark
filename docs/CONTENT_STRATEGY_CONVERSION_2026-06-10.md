# Conversion / CTA Strategy — Compassion Benchmark

**Author:** conversion-strategist agent
**Date:** 2026-06-10
**Scope:** CTA strategy and funnel coherence across `/updates` + homepage, entity detail, score-watch, forward-watch, and commercial pages.
**Constraint:** Analysis only. No code changed. Independence policy is absolute — every ask must build trust, never imply pay-to-influence.

---

## Method

Grounded in the live components and pages. Current CTA copy is quoted from file so each proposal is a concrete swap, not a vibe. Scoring per the role spec:

> **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (each sub-score 1–5).

---

## Funnel snapshot (the problem in one paragraph)

The free research is rigorous and the site already has the *assets* of a great funnel — a daily briefing, an entity-scoped Score-Watch product, a weekly email. But the **conversion moments are misplaced and the asks compete**. The `/updates` header fires **four equal buttons** before the reader has read anything (`DailyBriefingHeader.tsx` L127–134). The genuine intent peak — `CompletionBlock.tsx` "You're all caught up" — has **no CTA at all** (L80–98). The highest-intent page on the whole site, `/updates/forward-watch` (a reader staring at dated events that *will move a named entity's score*), has **zero conversion capture**. And there is a live **message-match defect**: the entity page promises a "Monday" digest while every other surface says Friday. Below, ranked by priority.

---

## Candidate 1 — Put the primary CTA at the intent peak: convert "You're all caught up"

- **Page(s):** `/updates` and every `/updates/[date]` — `site/src/components/updates/briefing/CompletionBlock.tsx`
- **Problem:** The reader has just consumed the entire briefing. This is the textbook "I want more of this" moment. The current block is a pure dead end — a checkmark and a metadata line (`{heroDate} briefing · Issue No. {issueNo} · {entitiesScanned} entities reviewed · benchmark current as of {currentAsOf}`, L84–98). No next step. The SubscribeCTA *follows* it as a separate heavy block, so the moment of completion and the ask are visually decoupled.
- **Proposed change:** Add one benefit-led inline capture *inside* the completion card, directly under "You're all caught up." Copy:
  > **Don't come back to find out — get the next one.**
  > One email every Friday with the week's most consequential score moves. Free. ~1,160 entities, evidence-linked.
  > `[ email field ] [ Get Friday's briefing ]`
  Use the existing `NewsletterSignup variant="inline-compact"` with `source="updates-completion"`. Keep the metadata line beneath it. This makes the completion block do double duty (closure + capture) instead of pushing the ask to a separate section the reader may scroll past.
- **Conversion benefit:** Moves the primary subscribe ask from a low-intent header position and a standalone block to the single highest-intent pixel in the experience. Captures reader→subscriber at peak satisfaction.
- **Independence check:** PASS. Free email, plainly labeled, no entity influence. Builds trust ("benchmark current as of…" reinforces freshness).
- Impact **5** · Strategic Alignment **5** · Learning Value **4** · Confidence **5** · Effort **2** · Risk **1** → **Priority = 16**

---

## Candidate 2 — Fix the entity-page message-match defect ("Monday" → Friday) and rewrite the secondary CTA

- **Page(s):** Every entity detail page — `site/src/components/entity/EntityDetail.tsx` L491–503
- **Problem:** The secondary newsletter card reads **"Every Monday: the benchmark digest"** (L496) and "Score changes, sector trends, and emerging risk signals from overnight research across 1,155 entities" (L498–500). Every other surface — `SubscribeCTA.tsx`, `NewsletterSignup.tsx` (×4), the success state — says the email ships **Friday**. A factual contradiction on a buyer-facing page erodes the exact credibility this institution sells. It also leaks the stale "1,155" count (homepage already uses 1,160 in places).
- **Proposed change:** Correct the day and tighten to benefit-led copy:
  > **Free — the Friday briefing**
  > **See it move before your stakeholders do.**
  > One email every Friday: the week's biggest score changes, sector trends, and risk signals from overnight research across ~1,160 entities. Free. Unsubscribe anytime.
  Keep `NewsletterSignup variant="inline-compact"`. Leaves Score-Watch as the clear primary on the page; this is the trust-building free fallback for readers not ready for $79.
- **Conversion benefit:** Removes a trust-killing inconsistency at the point of sale; gives the non-buyer a clean, honest secondary action instead of a wrong promise.
- **Independence check:** PASS. Pure correction + clarity. Strengthens trust.
- Impact **4** · Strategic Alignment **5** · Learning Value **3** · Confidence **5** · Effort **1** · Risk **1** → **Priority = 15**

---

## Candidate 3 — Add Score-Watch capture to `/updates/forward-watch` (the site's highest-intent dead end)

- **Page(s):** `site/src/app/updates/forward-watch/page.tsx`
- **Problem:** This page lists **dated trigger conditions that, if met, would move a named entity's score** — investors and analysts arrive here precisely because they care about a specific name's next move. Yet there is no conversion path: the only links are to methodology, the archive, and entity pages (L185–191). The reader's just-formed intent ("I want to know the moment this resolves") maps *exactly* to the Score-Watch product, and we ask for nothing.
- **Proposed change:** Add a message-matched band above "Open triggers" and a per-row affordance:
  > **These dates won't email themselves.**
  > Watch any entity below and get the alert the morning its score actually moves — delta, band change, and the evidence. $79/yr per entity. `[ Browse entities to watch → ]` (links `/score-watch` primary; secondary "How Score-Watch works").
  Where a row has a resolvable `slug`, add a subtle inline "Watch →" link routing to that entity's detail page (where the existing Score-Watch CTA lives), firing `score_watch_click` intent context `source=forward-watch`.
- **Conversion benefit:** Turns the single most purchase-aligned audience on the site from a dead end into the top of the Score-Watch funnel. Message match is near-perfect (dated trigger → alert-on-trigger product).
- **Independence check:** PASS. Score-Watch is an observer product; the page already exists to document triggers neutrally. The CTA sells *access to notification*, not influence. Reinforce with the existing "purchase does not affect the score" framing.
- Impact **5** · Strategic Alignment **4** · Learning Value **5** · Confidence **4** · Effort **2** · Risk **2** → **Priority = 14**

---

## Candidate 4 — Collapse the `/updates` header from 4 equal buttons to 1 primary + quiet links

- **Page(s):** `site/src/components/updates/briefing/DailyBriefingHeader.tsx` L127–134
- **Problem:** Four same-weight buttons fire before any value is delivered: `Read today's brief`, `Subscribe`, `View methodology`, `Explore indexes`. Per principle #1, a surface with four equal CTAs has none. "Subscribe" at the top — before the reader has seen a single finding — is a premature ask competing with the one thing they came to do (read).
- **Proposed change:** One primary, the rest demoted to inline text links:
  > Primary button: **Read today's brief** (jumps to `#lead-signal`).
  > Below it, a single muted line: "Or jump to *Methodology* · *Indexes* · *Subscribe (Fridays, free)*."
  Move the real Subscribe conversion to the completion block (Candidate 1), where intent is high. The header's job is to start the read, not to convert.
- **Conversion benefit:** Sharpens primary-action clarity (3-second test), and stops spending the top-of-page attention on an ask the reader isn't ready for — which lifts the *downstream* subscribe rate by relocating it to the peak.
- **Independence check:** PASS. No content change, only hierarchy. Neutral-to-positive on trust (less salesy above the fold).
- Impact **3** · Strategic Alignment **4** · Learning Value **4** · Confidence **4** · Effort **2** · Risk **1** → **Priority = 12**

---

## Candidate 5 — Reframe the post-briefing purchase Callout from a 3-button menu to one staged offer

- **Page(s):** `site/src/components/updates/DailyBriefing.tsx` L455–479 (Purchase CTA Callout)
- **Problem:** After SubscribeCTA, the briefing closes with a triple-equal commercial ask — `Purchase Research`, `Request Certified Assessment`, `Book Advisory` (L469–475). Three cold high-commitment asks side by side, immediately after a *free* email ask, is decision overload and tonally jarring (free → "buy a certified assessment" in one scroll). None is primary.
- **Proposed change:** One primary, benefit-led, with the others as a single quiet "for institutions" line:
  > **Daily briefings show the headline. The full report shows the work.**
  > Complete methodology, all 40 subdimension scores, full evidence trails, and sector analysis — by index and year.
  > `[ Browse research reports → ]` (primary, `/purchase-research`)
  > Quiet line beneath: "Need a formal review or a private briefing? *Certified assessments* · *Advisory*."
- **Conversion benefit:** Replaces a 3-way coin-flip with a clear path for the most common buyer (report purchase) while preserving routes for the rare enterprise reader. Reduces choice friction at the bottom of the funnel.
- **Independence check:** PASS. Commercial copy explicitly supports access/interpretation, not score changes. Add no language implying influence.
- Impact **3** · Strategic Alignment **4** · Learning Value **3** · Confidence **4** · Effort **2** · Risk **1** → **Priority = 11**

---

## Candidate 6 — Give the homepage hero one primary action (not three equal buttons)

- **Page(s):** `site/src/app/page.tsx` L61–67
- **Problem:** The hero offers `Explore Indexes` / `Read Methodology` / `Purchase Research` at equal weight. For a first-time visitor who doesn't yet trust the institution, "Purchase Research" as a co-equal hero CTA is a premature monetization ask that competes with the free exploration that actually earns the trust. The newsletter signup is buried much lower (L199–203) as a bare inline form with no headline framing — the reader→subscriber capture is weak and late.
- **Proposed change:** Hero: **Explore Indexes** primary; **Read Methodology** secondary text link; drop "Purchase Research" from the hero (Services section already routes buyers, L348–397). Then give the mid-page newsletter section a benefit-led frame instead of a naked form:
  > **The benchmark, in your inbox every Friday.**
  > One email — the week's biggest institutional score moves, evidence-linked, across ~1,160 entities. Free.
- **Conversion benefit:** Clear single hero action for cold traffic (explore the free value), and a framed — not orphaned — subscribe capture that reads as a benefit rather than a form.
- **Independence check:** PASS. Leads with free value; commercial routes remain available downstream. This is the "free value is the funnel" principle applied.
- Impact **3** · Strategic Alignment **4** · Learning Value **3** · Confidence **4** · Effort **2** · Risk **1** → **Priority = 11**

---

## Candidate 7 — Convert the `/updates/archive` page (a content-rich dead end)

- **Page(s):** `site/src/app/updates/archive/page.tsx`
- **Problem:** The archive showcases "42 days of evidence-linked institutional findings across 1,155 entities" (metadata, L13–14) — strong proof of consistency and rigor — but offers the reader *no* next action beyond browsing more entries. A visitor impressed by the cadence has nowhere to convert.
- **Proposed change:** Add one slim capture strip at the top or bottom of the list, framed around the proof the page just demonstrated:
  > **42 briefings and counting. Never miss the next one.**
  > The week's most consequential findings, every Friday. Free. `[ email ] [ Subscribe ]`
  `NewsletterSignup variant="inline"` `source="updates-archive"`.
- **Conversion benefit:** Captures reader→subscriber at the moment the archive has *proven* the value of subscribing (track record visible), rather than letting a high-consideration visitor leave.
- **Independence check:** PASS. Free, honest, proof-led. Builds trust.
- Impact **3** · Strategic Alignment **3** · Learning Value **3** · Confidence **4** · Effort **2** · Risk **1** → **Priority = 10**

---

## Candidate 8 — Tighten the Score-Watch hero promise + de-risk the price ask

- **Page(s):** `site/src/app/score-watch/page.tsx` L47–62 and closing CTA L319–336
- **Problem:** The hero CTA "Subscribe — $79/yr per entity" leads with **price and mechanism** before the reader feels the benefit; the differentiator ("not another weekly newsletter") is buried in a section subhead (L72). The de-risking proof ("a fraction of one analyst hour," L201–204) and the refund guarantee (L231–271) sit far below the ask, so the price objection hits before the reassurance.
- **Proposed change:** Lead the hero with benefit, attach price as a reassurance microline, and pull one risk-reverser up next to the button:
  > H1 stays. Sub: **Know the moment a single institution's score moves — before it's in the news cycle.**
  > Primary: **Watch your first entity** · microcopy beside it: "$79/yr · one entity · cancel anytime · full refund if no alert in 14 days."
  Closing CTA: change "Start with one entity" button label from "Subscribe — $79/yr per entity" to **"Pick an entity to watch →"** (benefit/action, not price-first).
- **Conversion benefit:** Benefit-before-price ordering and an adjacent risk-reverser lift click-through on the paid product's primary CTA; "watch your first entity" lowers the perceived commitment vs. "subscribe."
- **Independence check:** PASS. Reuses existing independence-safeguards framing; no influence implied. The refund line is honest, not manufactured urgency.
- Impact **3** · Strategic Alignment **3** · Learning Value **3** · Confidence **3** · Effort **2** · Risk **1** → **Priority = 9**

---

## Candidate 9 — Stop "Subscribe" meaning two different products; unify the language

- **Page(s):** Cross-cutting — `DailyBriefingHeader.tsx` (`Subscribe` → email), `EntityDetail.tsx` (`Subscribe — $79/yr` → Score-Watch), `score-watch/page.tsx` (`Subscribe`), `NewsletterSignup.tsx` (`Subscribe`)
- **Problem:** The verb "Subscribe" currently denotes **two distinct things** — the free Friday email *and* the paid $79 Score-Watch alert — sometimes within one page (entity detail shows free "Subscribe" form and paid "Subscribe — $79/yr" within the same CTA section, L444 vs L502). This ambiguity costs clicks and erodes the clean reader→subscriber→buyer ladder.
- **Proposed change:** Reserve **"Subscribe / Get the Friday briefing"** for the free email everywhere, and rename the paid action to **"Watch [entity]"** / **"Start watching"** / **"Pick an entity to watch."** Free = *subscribe*; paid = *watch*. Apply consistently so each verb maps to exactly one product and one funnel stage.
- **Conversion benefit:** Removes label collision so each CTA's outcome is unambiguous; makes the two-stage funnel (free email → paid watch) legible and individually trackable.
- **Independence check:** PASS. Naming only; both products already independence-clean.
- Impact **3** · Strategic Alignment **3** · Learning Value **2** · Confidence **4** · Effort **2** · Risk **1** → **Priority = 9**

---

## Priority ranking

| # | Candidate | Priority |
|---|-----------|----------|
| 1 | CTA at the "all caught up" intent peak | **16** |
| 2 | Fix entity-page Monday→Friday defect + rewrite | **15** |
| 3 | Score-Watch capture on forward-watch | **14** |
| 4 | Collapse `/updates` header to 1 primary | **12** |
| 5 | Reframe post-briefing purchase Callout | **11** |
| 6 | Homepage hero single primary + framed signup | **11** |
| 7 | Convert the archive dead end | **10** |
| 8 | Score-Watch benefit-before-price hero | **9** |
| 9 | Unify "Subscribe" vs "Watch" language | **9** |

---

## Single highest-leverage conversion change site-wide

**Move the primary subscribe ask out of the `/updates` header and into the `CompletionBlock` (Candidate 1).**

It is the only change that sits at the genuine intent peak — the reader has just finished the entire briefing and feels the value — while simultaneously fixing the founder's "wasted space" concern by giving the currently inert "You're all caught up" block a job. It costs almost nothing (reuse `NewsletterSignup variant="inline-compact"`), carries near-zero independence risk (free email, honestly framed), and is cleanly trackable via `source="updates-completion"` so we *learn* whether peak-placement beats header-placement. Every other candidate improves a surface; this one fixes the central mistake in the funnel — asking before value is delivered, and going silent the instant it is.
