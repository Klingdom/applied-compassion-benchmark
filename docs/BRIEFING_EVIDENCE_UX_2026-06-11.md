# BRIEFING_EVIDENCE_UX_2026-06-11
## UX Design: Presenting Richer Evidence on the Daily Briefing Page

**Scope:** How to surface verbatim quotes, source URLs, and expanded evidence on `/updates/[date]` without undoing Wave E1 density gains.

**Ground truth read:**
- `SignalCard.tsx` — compact grid card, title + first-sentence summary + severity badge + "View profile" link. No source affordance.
- `LeadSignalCard.tsx` — large hero card, 2-sentence what/why split, meta row. No source affordance.
- `ScoreMovementCard.tsx` — assessment row with `whyHeadline`, `dominantDimension` chip, `primaryEvidenceUrl` (icon-only 24px button), `distanceToBoundary`, `nextForwardSignal`. Evidence exists but is an anonymous icon — domain is hidden until hover title.
- `EvidenceLedger.tsx` — bottom-of-page table: domain, source type badge, entity, dimension, "Open ↗" link. Functional but disconnected from the signals it backs. No quotes. No publisher name in context.
- `2026-06-08.json` — `topSignals[].description` contains full multi-source prose (e.g. UAE signal cites UN FFM, Conflict Insights Group, Amnesty, Sudan ICJ filing in one paragraph); `recentAssessments[].primaryEvidenceUrl` is a single URL string. No quote field, no per-signal source array yet.
- `india-2026-06-01.json` `key_evidence[]` — verbatim strings with embedded publisher attribution (e.g. "HRW World Report 2026 (India chapter): Bangladesh reported 1,500+ men, women and children expelled May-June without due process..."). This is the incoming structured form.

**Wave E1 constraint:** The above-the-fold density work must not be unwound. Evidence affordances must add value-per-pixel, not blank vertical space.

---

## Candidate 1: Inline Evidence Attribution Line on SignalCard

**Surface:** `SignalCard.tsx` — the compact grid card used in `SignalStack`.

**Problem (file evidence):** `SignalCard` renders `signal.description` as a `line-clamp-2` paragraph and a "View profile" link. When the pipeline adds `signal.sources[]` (array of `{url, publisher, date}`), there is no display path. Users see a claim with no source cue whatsoever. The `EvidenceLedger` exists but is visually disconnected — a reader scanning the grid has no signal that sources exist.

**Proposed UX change:**
Below the summary paragraph, add one attribution line (not a new section, not a disclosure) when `signal.sources` has at least one entry:

```
[Publisher name] · [Date if available] ↗
```

Render as a single `<a>` tag using the first source. If `sources.length > 1`, append a count chip: `+2 more`. The chip opens the EvidenceLedger anchor (`#evidence-ledger`) rather than expanding inline — no additional DOM state needed. Font: `0.73rem`, color `--color-muted-subtle`, underline on hover. External link opens in new tab with `noopener noreferrer`.

This requires the pipeline to populate `signal.sources[0].publisher` and `signal.sources[0].date`. The UX does not break if these fields are absent — the line simply does not render.

**Why it improves scannable credibility:** Every claim in the grid acquires a provenance stamp at the same line cost as the existing "View profile" footer link, which it sits above. Readers doing triage ("is this sourced to a UN body or a blog?") get the answer without leaving the card. No layout reflow.

**Independence check:** Attribution line links to the source directly — not to Compassion Benchmark commentary. Publisher name is rendered as-received from pipeline data, not editorially reworded. Dead-link risk is present (external URLs rot); the EvidenceLedger already accepts this risk for all `Open ↗` links. Treat identically.

**Scoring:**
- Impact: 4 — removes the biggest credibility gap on the most-seen surface
- Strategic alignment: 4 — supports "benchmark institution" positioning; sourced claims are the product
- Learning value: 3 — reveals which source types the pipeline favors
- Confidence: 4 — narrow DOM change; degrades gracefully if data absent
- Effort: 2 — one template addition in `SignalCard.tsx` + pipeline schema extension
- Risk: 1 — additive only; no existing functionality changes

**Priority = (4+4+3+4) − 2 − 1 = 12**

---

## Candidate 2: Pull-Quote Block in LeadSignalCard

**Surface:** `LeadSignalCard.tsx` — the hero card at the top of the briefing.

**Problem (file evidence):** The lead card renders up to 4 sentences of `description` prose split into "What happened" / "Why it matters" columns. For the UAE June 8 signal, this prose is dense (four source chains named inline). The reader must parse prose to identify which organizations said what. No verbatim language appears anywhere on the page. The `india-2026-06-01.json` `key_evidence` strings show what structured verbatim evidence looks like: short attributed quotes are already present in change proposals but never surface to the briefing page.

**Proposed UX change:**
Add a third panel below the two-column grid (full width on mobile, full width on desktop), visible only when `lead.keyEvidence[0]` exists. Render the first `key_evidence` string as a styled pull-quote:

- Left border: `2px solid {color}55` (severity color, semi-transparent)
- Font: `0.88rem`, `--color-text`, `font-style: normal` (not italic — italic at this density is harder to scan)
- Attribution chip: `text-[0.72rem] text-muted-subtle` at end of quote, formatted as `— [Publisher] ↗`
- Max 2 lines via `line-clamp-2`; no "Read more" expansion — overflow is hidden to maintain density

If `keyEvidence.length > 1`, a `+N more` label appears at the bottom right of the panel, linking to `#evidence-ledger`. This does not expand inline.

Pull-quote is rendered only for `lead.actionType === "band-crossing-finding"` or `lead.severity === "critical"`. Rotation confirmations and floor-only confirmations do not get pull-quotes.

**Why it improves scannable credibility:** The lead card is the highest-attention surface. A single verbatim line from a UN report or HRW filing does more credibility work than a paragraph of paraphrase. The left-border treatment is visually distinct without adding a new section. The `+N more` chip drives users to the EvidenceLedger without duplicating it.

**Independence check:** Quote text comes from `key_evidence[]` in the pipeline output, which is extracted from source documents. The attribution chip must link to the source URL, not to an internal page. Pipeline must not produce paraphrased "quotes" — this is a pipeline discipline rule, not a UX rule, but the UX spec depends on it.

**Scoring:**
- Impact: 5 — highest-visibility surface; verbatim + attribution is the strongest credibility signal
- Strategic alignment: 5 — directly embodies "show your work" positioning
- Learning value: 4 — teaches readers what kind of evidence the benchmark accepts
- Confidence: 3 — depends on pipeline populating `keyEvidence[]` reliably; current JSON has it in change-proposals only, not in briefing topSignals
- Effort: 3 — moderate; requires pipeline to propagate `keyEvidence` into `topSignals` + new LeadSignalCard panel
- Risk: 2 — fabricated/paraphrased quotes would damage credibility; requires pipeline discipline

**Priority = (5+5+4+3) − 3 − 2 = 12**

---

## Candidate 3: "Sources (N)" Disclosure on ScoreMovementCard

**Surface:** `ScoreMovementCard.tsx` — the assessment rows in `ScoreMovementDashboard`.

**Problem (file evidence):** `ScoreMovementCard` already has `primaryEvidenceUrl` wired up as an anonymous 24px icon button. The hover `title` attribute reveals the domain (e.g. `refugeesinternational.org`) but this is invisible until hover and completely inaccessible on mobile. Multiple sources are not representable — the schema accepts one URL. When the pipeline adds `sources[]` arrays, the card has no display path for them. The `whyHeadline` field is already rendering concise rationale; what is missing is the source chain that backs it.

**Proposed UX change:**
Replace the anonymous icon button with a named chip: `[Publisher] ↗`. If `sources.length > 1`, use `Sources (N) ↗` instead. The chip links to the first source URL. If `sources.length > 1`, the chip links to `#evidence-ledger` (which contains all sources, already filterable by entity once that column is used).

Chip style: `text-[0.73rem] text-muted underline-offset-2 underline decoration-[rgba(255,255,255,0.15)] hover:text-accent`. Sits in the existing right-side pill group, replacing the current 24px icon. Net width change: approximately 80px wider than the icon — acceptable in the existing flex-wrap row.

On mobile the chip wraps below the score row naturally; no layout change required.

**Why it improves scannable credibility:** The domain name visible at a glance ("Reuters ↗" vs "Gov ↗" vs "Amnesty ↗") signals source quality without the user having to hover or click. This is the difference between an anonymous external link and attributed evidence. The chip is more compact than the current icon + hover interaction, and accessible on touch.

**Independence check:** Publisher name should match `extractDomain()` output or be the explicit `publisher` field if provided — no editorial rewriting. The link is to the source, not to commentary.

**Scoring:**
- Impact: 4 — assessments section is high-scan; named sources reduce "who said this?" friction
- Strategic alignment: 4 — attributed sources reinforce institutional rigor
- Learning value: 3 — source type visible at a glance
- Confidence: 5 — minimal change; `primaryEvidenceUrl` already exists; named chip is a drop-in replacement
- Effort: 1 — change one render block in `ScoreMovementCard.tsx`; no schema change for single-source case
- Risk: 1 — no new functionality; degrades identically if URL absent

**Priority = (4+4+3+5) − 1 − 1 = 14**

---

## Candidate 4: EvidenceLedger Quote Column

**Surface:** `EvidenceLedger.tsx` — the bottom-of-page source table.

**Problem (file evidence):** The current table has 5 columns: Source (domain), Type, Entity, Dimension, Link. It has no quote column and no way to show what the source actually said. A reader who navigates to the ledger to "see the work" finds a list of domains and entities but cannot verify the claim-to-source connection without clicking out. The India change proposal shows that `key_evidence[]` strings are already attribution-formatted — the data exists, it just never reaches the ledger.

**Proposed UX change:**
Add a sixth column "Finding" between Dimension and Link. Render the first 80 characters of the matched `key_evidence` string (or the source's matched claim), truncated with an ellipsis. This column is hidden at `< sm` breakpoints via `hidden sm:table-cell`.

If the quote is longer than 80 characters, the cell uses `title` attribute to expose the full text on hover.

The Link column becomes a small `↗` icon only (it already is, but confirm it stays compact to balance the new column width).

No accordion, no expand interaction — the ledger is already the "full detail" surface. Adding a quote column keeps it as a flat scannable table, consistent with Wave E1 density principles.

**Why it improves scannable credibility:** The ledger currently proves that sources were consulted but not what they said. Adding the finding column bridges the claim-to-source chain without requiring click-out. For independent researchers verifying the benchmark, this is the highest-value addition to the ledger.

**Independence check:** Quote text must be the pipeline's extracted or verbatim string, not editorial summary. Column header should read "Finding (extracted)" to signal that it is a pipeline output, not Compassion Benchmark's characterization.

**Scoring:**
- Impact: 3 — ledger is read by deep-audit users, not casual readers; high value per user, lower total reach
- Strategic alignment: 5 — "show your work" is core to the benchmark's independence positioning
- Learning value: 5 — most explicit demonstration of evidence chain
- Confidence: 3 — depends on pipeline attaching `quote` to each source row; current `EvidenceLedger` extracts sources from `topSignals.sources[]` which are currently URL strings only
- Effort: 3 — table column addition + pipeline schema extension (`sources[].quote`)
- Risk: 2 — truncated quotes can misrepresent; full quote on hover is a partial mitigation; pipeline must not produce paraphrase

**Priority = (3+5+5+3) − 3 − 2 = 11**

---

## Candidate 5: Signal-Level "Evidence" Disclosure (Native `<details>`)

**Surface:** `SignalCard.tsx` — the compact grid card.

**Problem (file evidence):** The `SignalCard` description is already truncated to `line-clamp-2`. For signals with multi-source backing (UAE June 8 has four independent chains), there is no way to access the full rationale or any source list without navigating to the entity profile. The `HistoryTimeline` (Wave E1) already uses native `<details>` for Tier-D run compaction — a precedent for progressive disclosure in this codebase.

**Proposed UX change:**
Add a `<details>` element below the summary paragraph. The `<summary>` is a single line: `Evidence (N)` where N is `signal.sources.length`. Expanded state shows:
1. A quote block: first `key_evidence` string, 2-line max, with publisher chip
2. A source list: `sources.map()` → publisher chip + domain + `↗` icon, stacked vertically, `gap-1.5`

The `<details>` is closed by default. No JavaScript state needed. Native `<details>` with `open` attribute is used; CSS `summary { cursor: pointer; }` is sufficient.

On mobile, the expanded state reflows within the card width. Card does not grow to full column width when expanded.

This adds approximately 32px to the card when collapsed (the summary line height) and approximately 80px when expanded.

**Why it improves scannable credibility:** The grid stays compact by default. Users who want to verify a specific claim can expand that signal's sources without leaving the page. The `Evidence (N)` count is visible collapsed, which itself signals "this is backed" without requiring expansion.

**Independence check:** The disclosure does not add editorial commentary — it surfaces pipeline-extracted evidence strings and source URLs only. The count `N` must match actual `sources[]` length, not be inflated.

**Scoring:**
- Impact: 3 — grid remains compact by default; evidence only visible on demand
- Strategic alignment: 4 — inline disclosure aligns with "show your work"
- Learning value: 3 — users learn evidence exists; detail requires expansion
- Confidence: 3 — native `<details>` is safe; depends on `sources[]` in pipeline
- Effort: 2 — native HTML element; no new state; follows existing `<details>` pattern from HistoryTimeline
- Risk: 2 — collapsed state adds 32px to every card even when sources absent; need conditional render

**Priority = (3+4+3+3) − 2 − 2 = 9**

---

## Candidate 6: Named Source Chip on LeadSignalCard Meta Row

**Surface:** `LeadSignalCard.tsx` — meta row (band, confidence, entity link).

**Problem (file evidence):** The meta row at the bottom of the lead card has band badge, confidence chip, and "View entity profile" link. There is no source link whatsoever. For the highest-attention signal on the page, the absence of any source attribution is the most visible credibility gap in the current UI.

**Proposed UX change:**
Add up to 3 source chips to the meta row, left-aligned before the spacer, between confidence and the entity link. Each chip: `[Publisher] ↗` in `text-[0.73rem] text-muted-subtle underline`. On mobile (`< sm`), show only 1 chip. If `sources.length > 3`, a `+N more ↗` chip links to `#evidence-ledger`.

If `sources[]` is absent but `primaryEvidenceUrl` exists (current state), render a single `Source ↗` chip using the domain from `extractDomain()`.

This makes the current single `primaryEvidenceUrl` field immediately more visible — without waiting for pipeline schema extension — by surfacing it as a named chip rather than nothing.

**Why it improves scannable credibility:** The lead card is the most-read surface. Source chips in the meta row are in a natural read-path position. The reader's eye flows: title → what happened → why it matters → [meta: band | confidence | Reuters ↗ | UN ↗ | View entity →]. No separate section needed.

**Independence check:** Same as Candidate 3. Publisher name = domain or explicit `publisher` field. Links to sources, not to internal commentary.

**Scoring:**
- Impact: 4 — lead card, highest-visibility surface
- Strategic alignment: 4 — attribution on the most prominent signal
- Learning value: 2 — chips show source exists but not what it says
- Confidence: 5 — for the single-URL case (`primaryEvidenceUrl`), zero new schema required; `extractDomain()` already exists in `utils.ts`
- Effort: 1 — one render addition to `LeadSignalCard.tsx` meta row
- Risk: 1 — purely additive; chip absent if data absent

**Priority = (4+4+2+5) − 1 − 1 = 13**

---

## Candidate 7: EvidenceLedger "Jump-from" Anchors (Source-to-Ledger Connectivity)

**Surface:** `EvidenceLedger.tsx` + all signal/assessment surfaces that link to it.

**Problem (file evidence):** The EvidenceLedger is already well-structured as a table, but it is a destination with no inbound wayfinding from the signals it backs. The Candidate 1 and Candidate 3 "+N more ↗" chips propose linking `#evidence-ledger`, but the ledger has no filtering — clicking that anchor dumps the user at the top of a full table with no highlight of which rows pertain to their signal. On a briefing with 10+ assessed entities and 20+ sources, this is disorienting.

**Proposed UX change:**
Add a URL-hash filter to `EvidenceLedger`: `#evidence-ledger?entity=united-arab-emirates`. On mount (client component), read `window.location.search` for an `entity` query parameter and highlight (not filter) matching rows with a left border: `border-l-2 border-l-accent`. Non-matching rows remain visible but at reduced opacity (`opacity-60`). A "Show all" chip resets the highlight.

This is a `"use client"` addition to `EvidenceLedger.tsx`. The highlight state initializes from the URL and is not persisted.

Alternatively, use `id` anchors on each row (`id={row.entity}-{i}`) and anchor directly to the first matching row — simpler, no client JS.

The simpler row-anchor approach is preferred for a static-export site.

**Why it improves scannable credibility:** Inbound links from signal cards to specific ledger rows close the "find the source for this claim" loop. Without this, the `+N more ↗` chips in Candidates 1, 3, and 5 land the user at the top of an undifferentiated table.

**Independence check:** Highlight is purely navigational. No editorial weighting of rows.

**Scoring:**
- Impact: 2 — improves navigation to an already-secondary surface; no new credibility signal
- Strategic alignment: 3 — ledger connectivity supports "show your work" completeness
- Learning value: 2 — wayfinding, not new information
- Confidence: 4 — row anchors are trivial HTML; query-param approach needs client component
- Effort: 2 — row IDs are trivial; query-param highlight is moderate (client component, useEffect)
- Risk: 1 — additive; no functionality change

**Priority = (2+3+2+4) − 2 − 1 = 8**

---

## Summary Table

| # | Title | Impact | Strategic | Learning | Confidence | Effort | Risk | Priority |
|---|-------|--------|-----------|----------|------------|--------|------|----------|
| 3 | Named Source Chip on ScoreMovementCard | 4 | 4 | 3 | 5 | 1 | 1 | **14** |
| 6 | Named Source Chip on LeadSignalCard meta row | 4 | 4 | 2 | 5 | 1 | 1 | **13** |
| 1 | Inline Evidence Attribution Line on SignalCard | 4 | 4 | 3 | 4 | 2 | 1 | **12** |
| 2 | Pull-Quote Block in LeadSignalCard | 5 | 5 | 4 | 3 | 3 | 2 | **12** |
| 4 | EvidenceLedger Quote Column | 3 | 5 | 5 | 3 | 3 | 2 | **11** |
| 5 | Signal-Level Evidence Disclosure (`<details>`) | 3 | 4 | 3 | 3 | 2 | 2 | **9** |
| 7 | EvidenceLedger Jump-from Anchors | 2 | 3 | 2 | 4 | 2 | 1 | **8** |

---

## Highest-Leverage Pattern

**Named source chips everywhere there is already an external link, before any quote work.**

Candidates 3 and 6 both score 13-14 and require zero schema changes for the current single-URL state of the data — `extractDomain()` already exists, `primaryEvidenceUrl` is already wired. They replace anonymous icon buttons and blank meta rows with named publisher chips. This is the maximum credibility gain at minimum effort and zero risk.

The implementation sequence:

1. **Now (no pipeline change needed):** Replace the 24px anonymous icon in `ScoreMovementCard` with `[domain] ↗` chip. Add `[domain] ↗` chip to `LeadSignalCard` meta row. Both use `extractDomain(primaryEvidenceUrl)`. Two small edits, production-ready today.

2. **When pipeline adds `sources[].publisher`:** Upgrade chips to use publisher name instead of domain (e.g. "Reuters ↗" instead of "reuters.com ↗"). Add `+N more ↗` to `#evidence-ledger` when `sources.length > 1`. This makes Candidate 1 (SignalCard) live too.

3. **When pipeline propagates `key_evidence[]` into `topSignals`:** Add the pull-quote panel (Candidate 2) to `LeadSignalCard` for critical/band-crossing signals only. This is the highest single credibility signal but requires pipeline work first.

4. **Separately:** Add the quote column to `EvidenceLedger` (Candidate 4) as the "audit trail" surface for deep readers and institutional users. Lower urgency, high independence-positioning value.

Do not implement Candidate 5 (`<details>` on SignalCard grid) until Candidates 3 and 6 are live and the pipeline has `sources[]` populated — the disclosure element adds 32px to every card for a feature that only has value when sources exist.

Do not implement Candidate 7 until Candidate 4 (quote column) makes the ledger worth navigating to per-entity.
