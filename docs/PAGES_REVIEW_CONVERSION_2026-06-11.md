# Pages Conversion Review — Special Reports + /updates Refinements

**Author:** conversion-strategist agent
**Date:** 2026-06-11
**Scope:** TWO surfaces — Special Report pages (`/updates/special/[slug]` + index) [PRIORITY] and the `/updates` daily briefing [net-new refinements only].
**Lens:** ethical conversion / funnel — one primary action per surface, benefit-led, message-matched, placed at the intent peak, independence-first, no dark patterns.
**Mode:** read-only review. No code changed. All findings grounded in current files.

---

## Ground truth (what the files actually show)

**Special Report — `site/src/app/updates/special/[slug]/page.tsx`**
- Renders header → Key Findings → body sections → **footer nav** (lines 254–302) and stops. The footer nav has exactly two low-emphasis text links: "All special briefings" and "Latest daily briefing." There is **no subscribe capture, no related-content cross-link, no entity link** anywhere on the page.
- This is the institution's *highest-credibility, highest-intent* surface (a reader who finishes a ~2,000-word analytical report is maximally primed) and it is a **pure conversion dead-end**. No `NewsletterSignup` import exists in this file.

**Special Index — `site/src/app/updates/special/page.tsx`**
- Hero → "Back to daily briefing" link (lines 108–128) → list of report cards → stops (line 192). No capture at the bottom of the list; the only above-the-fold action sends readers *away* to the daily briefing before they have chosen a report.

**Manifest — `site/src/data/special-briefings/manifest.json`**
- Two reports today: `exemplars-2026-06-11` ("What Good Looks Like") and `floor-and-critical-2026-06-11` ("The Floor and the Critical Band"). The manifest's own `edition` text names Exemplars as *"the inverse companion to the Floor & Critical briefing."* They are an explicit, editor-declared pair — a built-in cross-link with perfect message match.

**Daily briefing (already covered by Wave E1/E2 — do not duplicate)**
- `MidBriefingSubscribe.tsx` — single-line prompt after the lead, reads `localStorage.cb_newsletter` and self-suppresses for subscribers. `source="updates-midbriefing"`.
- `CompletionBlock.tsx` — the single end-of-briefing ask, `NewsletterSignup variant="inline-compact" source="updates-completion"`, copy "Don't come back to find out — get the next briefing in your inbox."
- `forward-watch/page.tsx` — `NewsletterSignup variant="inline" source="forward-watch"` at the bottom.

**Primitives available**
- `NewsletterSignup.tsx` variants: `inline`, `inline-compact`, `card` (card = "Weekly score highlights — institutional compassion findings", Friday cadence, "Free.", "No spam. Unsubscribe anytime."), plus an optional `preamble` prop (card only) and a `source` analytics tag. Success copy: "Weekly highlights arrive every Friday."
- `gumroad.ts`: Score-Watch is `useGumroad: false`, **entity-scoped** ($79/yr/entity). It is NOT message-matched to a thematic cross-index report — do not put Score-Watch on special reports. The weekly briefing is the correct primary CTA here.

**Primary action for a Special Report reader (named):** *Subscribe to the free weekly briefing.* It is the honest, no-friction "more of exactly this" — a reader who just consumed the institution's best analytical work wants the next one. Secondary action: read the companion/related report (continue the funnel). Tertiary: explore an index. Score-Watch is wrong here (entity-scoped, paid, not message-matched).

---

## Candidates

Scoring key (1–5 each): Impact, Strategic Alignment, Learning Value, Confidence, Effort, Risk.
**Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.**

---

### C1. End-of-report subscribe capture (close the dead-end at the intent peak) — PRIORITY

- **Page:** `site/src/app/updates/special/[slug]/page.tsx`
- **Problem:** The report ends with footer nav only (lines 254–302). The single most-primed reader on the entire site — someone who read a full thematic deep-dive top to bottom — is offered nothing but two faint text links and then bounces. No `NewsletterSignup` on the page.
- **Proposed change:** Insert a `NewsletterSignup variant="card"` block **between the body (`</div>` at line 252) and the footer nav (line 255)** — the literal intent peak, immediately after value is delivered and before navigation. Use the `preamble` prop to message-match the report context:
  - **preamble:** *"You just read one of our deep-dives. We publish a new one every few weeks — and the week's most consequential score movements every Friday."*
  - Card retains its existing benefit-led body ("Weekly score highlights… every Friday. Free.") and trust line ("No spam. Unsubscribe anytime.").
  - **source:** `"special-report-end"` (new analytics tag — distinguishes the highest-intent capture point).
- **Conversion benefit:** Converts the site's highest-intent, currently-zero-conversion moment into a subscribe. Reader → subscriber, captured exactly where "I want more of this" peaks.
- **Independence check:** PASS. Free weekly research, honest cadence, no entity-paid implication. The ask *demonstrates* the institution gives away rigorous work — builds trust, doesn't spend it.
- **Impact 5 · Strategic Alignment 5 · Learning Value 4 · Confidence 5 · Effort 2 · Risk 1 → Priority = 16**

---

### C2. Companion-report cross-link block ("the inverse companion") — PRIORITY

- **Page:** `site/src/app/updates/special/[slug]/page.tsx`
- **Problem:** The two reports are an editor-declared pair (manifest: Exemplars is "the inverse companion to the Floor & Critical briefing"), yet the page offers no link from one to the other — only a generic "All special briefings" index link. The single most relevant next read is invisible.
- **Proposed change:** Add a "Read next" cross-link card directly **above the subscribe card (C1)**, surfacing the *other* report by title + dek (derive "the other briefing" from `manifest.briefings.filter(b => b.slug !== slug)`; with two reports, show the one companion; generalize to "the latest other report" as the set grows). Copy:
  - **eyebrow:** *"Read next — the companion analysis"*
  - **link title:** the other report's `title`; **sub:** its `dek` (truncated ~140 chars).
  - On `floor-and-critical`, this surfaces *"What Good Looks Like — Exemplars"*; on `exemplars`, it surfaces *"The Floor and the Critical Band."* Perfect message match — same scale, opposite end.
- **Conversion benefit:** Deepens the session (second high-value pageview), raises the chance the reader hits a second subscribe card, and frames the institution as a coherent body of work rather than isolated posts. Funnel: reader → engaged reader → subscriber.
- **Independence check:** PASS. Editorial cross-reference between two free research artifacts; no commercial pressure.
- **Impact 4 · Strategic Alignment 5 · Learning Value 4 · Confidence 5 · Effort 2 · Risk 1 → Priority = 15**

---

### C3. Index-page bottom capture + intent-peak reordering — PRIORITY

- **Page:** `site/src/app/updates/special/page.tsx`
- **Problem:** Two issues. (1) The list ends with no capture (stops at line 192) — anyone who scrolls the catalog and isn't ready to commit to a report leaves with no soft ask. (2) The only prominent action above the list ("Back to daily briefing", lines 108–128) pushes readers *off* this page before they engage with a report — premature exit ramp at the top of the funnel.
- **Proposed change:**
  - **Add** a `NewsletterSignup variant="inline"` block after the briefings `</ul>`/list container (after line 191), preamble-free, `source="special-index"`. Copy stays the standard inline ("Weekly compassion score highlights … Every Friday, free.").
  - **Demote** the "Back to daily briefing" link from a standalone prominent CTA to the same low-emphasis treatment as a secondary footer link (keep it, but it should not compete as the page's hero action). The hero's primary action should be "browse the reports below," which the list already is.
- **Conversion benefit:** Adds a capture at the index's natural scroll-end and stops bleeding intent out the top. Funnel: catalog browser → subscriber or report-reader instead of bounce-to-daily.
- **Independence check:** PASS. Standard free-briefing ask; no dark pattern.
- **Impact 4 · Strategic Alignment 4 · Learning Value 4 · Confidence 4 · Effort 2 · Risk 1 → Priority = 13**

---

### C4. Key-Findings → entity / index micro-CTA ("see the scores behind this") — PRIORITY

- **Page:** `site/src/app/updates/special/[slug]/page.tsx`
- **Problem:** Key Findings (lines 196–215) and body cite entities and bands (e.g., "64 entities in the Exemplary band", "176 in the Critical band") but link nowhere. A reader whose interest is piqued by a specific finding has no path into the live rankings — a missed funnel branch into the product's core free asset (the indexes), which is also where the eventual paid Score-Watch lives.
- **Proposed change:** Add a single, subordinate contextual link beneath the Key Findings list (after line 213), not per-finding (avoids CTA clutter / preserves the "one primary action" rule):
  - *"These findings draw on live scores across all seven indexes. Explore the rankings →"* linking to the indexes hub (`/` or the indexes landing).
  - Keep it visually subordinate to C1/C2 (text link weight, not a card).
- **Conversion benefit:** Opens a second funnel branch (report → indexes → entity page → eventual Score-Watch) for readers motivated by data rather than email. Captures a different intent than the subscribe ask.
- **Independence check:** PASS. Routes to free public rankings; no pay-to-influence implication.
- **Impact 3 · Strategic Alignment 4 · Learning Value 4 · Confidence 4 · Effort 2 · Risk 1 → Priority = 12**

---

### C5. Footer-nav copy upgrade — benefit-led labels, message-matched

- **Page:** `site/src/app/updates/special/[slug]/page.tsx`
- **Problem:** The existing footer links (lines 258–299) are mechanism-labeled — "All special briefings", "Latest daily briefing." They describe destinations, not reader value, and they're the *only* navigation a reader sees if C1/C2 aren't shipped.
- **Proposed change:** Re-label to benefit/curiosity-led copy (no structural change):
  - "All special briefings" → **"More deep-dives like this"**
  - "Latest daily briefing" → **"Today's score movements"**
  - Keep these as low-emphasis links *below* the C1 subscribe card so hierarchy stays: subscribe (primary) > companion report (secondary) > nav (tertiary).
- **Conversion benefit:** Cheap lift on click-through of the existing nav; reframes navigation as "more value here" rather than sitemap labels.
- **Independence check:** PASS. Copy-only; honest descriptions.
- **Impact 2 · Strategic Alignment 3 · Learning Value 2 · Confidence 5 · Effort 1 · Risk 1 → Priority = 10**

---

### C6. Index card "Read briefing" → reading-value label + report-count proof

- **Page:** `site/src/app/updates/special/page.tsx`
- **Problem:** Each card's CTA is "Read briefing" (lines 168–185) — generic mechanism. The hero also under-sells the catalog (no count, no cadence promise), missing low-cost specificity ("Specific > vague").
- **Proposed change:** (1) Card link copy "Read briefing" → **"Read the analysis →"**. (2) Add a one-line subhead under the hero h1 stating cadence + scope, e.g. *"In-depth analyses across 1,156 entities — a new one every few weeks."* (derive count from existing data; cadence honest per manifest editions). No layout change.
- **Conversion benefit:** Slightly higher card CTR + sets a return-cadence expectation that supports the subscribe ask. Reinforces credibility with specifics.
- **Independence check:** PASS. Honest, specific, no urgency.
- **Impact 2 · Strategic Alignment 3 · Learning Value 2 · Confidence 4 · Effort 1 · Risk 1 → Priority = 9**

---

### C7. [/updates NET-NEW] Special-report discovery prompt inside the daily briefing

- **Page:** `site/src/components/updates/briefing/CompletionBlock.tsx` (within `/updates/[date]`)
- **Problem:** Wave E1/E2 already own the daily-briefing subscribe asks (mid + completion) — do not duplicate. But there is **no surfacing of Special Reports from the daily briefing at all.** Daily readers (the largest engaged audience) never learn the deep-dives exist, so the special-report funnel has no top-of-funnel feed from the daily product. This is genuinely net-new, not an E1/E2 overlap.
- **Proposed change:** Add ONE subordinate text link inside the existing CompletionBlock card, *below* the existing subscribe row (after line 129), so it does not compete with the single primary ask:
  - *"Want the bigger picture? Read our latest deep-dive: [most-recent special report title] →"* linking to `/updates/special/[latest slug]`.
  - Pull the latest from `special-briefings/manifest.json`. Visually a quiet link, not a second card — preserves the completion block's single-CTA integrity.
- **Conversion benefit:** Feeds the daily audience into the high-converting special-report funnel (which, with C1, now captures subscribes). Cross-product funnel: daily reader → special report → subscribe.
- **Independence check:** PASS. Editorial link between two free products; subordinate placement keeps the one-primary-CTA rule intact.
- **Impact 3 · Strategic Alignment 4 · Learning Value 3 · Confidence 4 · Effort 2 · Risk 2 → Priority = 10**

---

## Priority ranking

| # | Candidate | Surface | Priority |
|---|-----------|---------|----------|
| C1 | End-of-report subscribe capture | Special report | **16** |
| C2 | Companion-report cross-link | Special report | **15** |
| C3 | Index bottom capture + reorder | Special index | **13** |
| C4 | Key-Findings → indexes micro-CTA | Special report | 12 |
| C5 | Footer-nav copy upgrade | Special report | 10 |
| C7 | Daily→special discovery prompt | /updates (net-new) | 10 |
| C6 | Index card label + proof | Special index | 9 |

---

## The single biggest conversion gap across the two pages

**The Special Report page is a total conversion dead-end at the site's single highest-intent moment.** A reader who finishes a full thematic deep-dive — the most engaged, highest-trust visitor the institution will ever get — reaches the bottom (`[slug]/page.tsx` lines 254–302) and is offered only two faint sitemap links and an exit. There is no subscribe capture, no companion-report continuation, no path into the data. Every other surface (daily briefing, forward-watch) already captures at its intent peak; the institution's *best* work captures nothing.

**Highest-leverage single change: C1** — drop a `NewsletterSignup variant="card"` with a context-matched `preamble` between the report body and the footer nav. It is low-effort (one component already built and styled), low-risk (no layout/comprehension change), and converts the most-primed audience on the site from a 0% capture to the funnel. C2 (companion cross-link) should ship alongside it to compound session depth.
