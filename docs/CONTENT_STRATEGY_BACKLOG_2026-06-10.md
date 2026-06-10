# Content Format & Information Strategy Overhaul — Consolidated (2026-06-10)

Goal: dramatically improve the **content format, information density, and CTA/conversion strategy** of `/updates` and other key pages. Consolidated by coordinator from five parallel lenses (two of them new durable agents):
- `CONTENT_STRATEGY_KNOWLEDGE_2026-06-10.md` (knowledge-architect — NEW agent)
- `CONTENT_STRATEGY_CONVERSION_2026-06-10.md` (conversion-strategist — NEW agent)
- `CONTENT_STRATEGY_UX_2026-06-10.md`
- `CONTENT_STRATEGY_PM_2026-06-10.md`
- `CONTENT_STRATEGY_COMPETITIVE_2026-06-10.md`

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (1–5).

---

## The convergent verdict

**Every one of the five lenses independently flagged the same #1 problem the founder named: the page wastes premium space on low-density hero elements, and asks for conversion at the wrong moments.**

- **Stat-of-the-Day is the worst value-per-pixel element on the site** (Knowledge 16 · UX C1 · PM · Competitive M1). A `clamp(2rem,5vw,3rem)` number in a full-padded card eats ~half the above-the-fold grid to deliver one fact that's restated twice below. Verdict: **collapse to a one-line strip (~75% less vertical), reclaim the space for the genuinely useful Today-in-Brief.**
- **The above-the-fold is bloated**: an oversized H1 ("Daily Briefing", ~70px), a 4-equal-button CTA cluster (decision paralysis), big stacked cards, generous section padding (UX: ~120–700px recoverable).
- **Conversion is asked at the wrong time**: 4 competing CTAs *before* value is delivered, then **silence at the "you're all caught up" completion block — the exact intent peak** (Conversion 16).
- **The system isn't taught**: scores/bands/dimensions (AWR/EMP/… headers, bare band pills) are only defined on /methodology; newcomers can't *read* the benchmark (Knowledge 15 · PM canonical-chip).
- **Cross-links are missing**: the new `/updates/forward-watch` ledger isn't linked from the briefing body (PM 16); entity pages don't link back to their source briefing (PM 15) — undermining the traceability claim.

---

## Ranked backlog (deduped across lenses)

### Wave E1 — Densify the above-the-fold (the founder's flag; mostly low-effort)
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 1 | **Stat-of-the-Day → dense one-line "Today's number" strip** (number 1.5–1.6rem inline w/ label+entity, icon-only copy-citation); reclaim the half-grid | Knowledge+UX+PM+Competitive (ALL) | **16** | Low |
| 2 | **Promote Today-in-Brief above the CTAs, unwrap the card** (bare bullets between thesis and actions — correct hierarchy for a briefing) | UX+Knowledge | 13 | Low |
| 3 | **Shrink the H1 + collapse the 4-button CTA cluster → 1 primary ("Read today's brief") + 1 inline subscribe** (the `inline-compact` NewsletterSignup already exists) | UX+Conversion+Competitive | 13 | Low |
| 4 | **Pipeline micro-strip** ("N reviewed · N assessed · N changes · N watches") restoring the trust signal at 1/4 the height | Competitive | 10 | Low |
| 5 | **Tighten detail-section vertical padding** (`py-[30px]`→`~py-[14px]`; recover ~480–720px over the briefing) | UX | 11 | Low |

### Wave E2 — Convert at the intent peaks (high-leverage CTA work)
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 6 | **Put a benefit-led email capture INSIDE the "all caught up" completion block** ("Don't come back to find out — get the next one. Fridays, free.") — the single biggest conversion fix | Conversion | **16** | Low |
| 7 | **Fix the entity-page Monday→Friday copy defect** (`EntityDetail.tsx:496` says "Every Monday"; everywhere else Friday) | Conversion | 15 | Trivial |
| 8 | **Score-Watch capture on `/updates/forward-watch`** (message-matched: "These dates won't email themselves") — most purchase-aligned audience, currently a dead end | Conversion | 14 | Low |
| 9 | **Identity-framed social proof + benefit copy in SubscribeCTA** | Conversion+Competitive | 12 | Trivial |
| 10 | **Mid-briefing inline subscribe after the lead** (after BrutalInsightCard; hide if `cb_newsletter` set) | Competitive | 12 | Low |

### Wave E3 — Teach the system + wire the IA (trust & comprehension)
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 11 | **Canonical score chip (number + band + optional delta) reused on every score surface** (index tables, home cards, briefing cards, entity heroes) | PM+Knowledge | 15/13 | Med |
| 12 | **Teach the band/score schema once, inline** (compact legend primitive on entity/index/hero; explain AWR/EMP/… dimension headers) | Knowledge | 15 | Med |
| 13 | **Link `/updates/forward-watch` from the briefing body + date-nav** (the ledger is unreachable from the reading flow) | PM | **16** | Trivial |
| 14 | **Entity page → link back to its source briefing** (`/updates/[date]` from `latestChange.date`) — restores the evidence→score traceability path | PM | 15 | Low |
| 15 | **Index-page anchor stat** ("2026 avg N/100 · top performer X · N ranked") above the ranking controls — shareable hook (WBA/TI pattern) | Competitive+Knowledge | 12 | Low |
| 16 | **Benefit-reframe the RankingTable mid-table CTA** ("See the full 40-subdimension breakdown…", "Get the {Index} Report") | Competitive | 12 | Trivial |
| 17 | **Methodology: sticky TOC + 30-second summary; homepage "8 dimensions" run-on → scannable gloss grid** | Knowledge | 13 | Med |
| 18 | **Semaform labeled-block taxonomy** ([DATA]/[ANALYSIS]/[WATCH]/[METHODOLOGY] pills) for scan orientation | Competitive | 11 | Med |

## Recommended sequencing
- **Wave E1 first** — it's the founder's explicit ask, mostly low-effort CSS/structure, and reclaims ~1.5+ screens of wasted vertical space. Items #1–#5 are one coordinated header/briefing refactor.
- **Wave E2** rides along — the completion-block CTA (#6) is *both* the top conversion fix *and* a "wasted space" win (the completion block is currently inert).
- **Wave E3** — comprehension + IA depth (canonical chip, schema teaching, cross-links, index anchor stats).

## Independence check
All PASS. The CTA changes (#6–#10) build trust (free value, honest cadence, no dark patterns/alarmism) rather than spend it. #14 (entity→briefing link) and #13 (forward-watch link) actively strengthen the evidence→score traceability that is the institution's credibility. No item implies pay-to-influence.

## Single highest-leverage change
**Compress the above-the-fold (Stat-of-the-Day strip + promoted Today-in-Brief + tightened header) AND move the primary subscribe ask into the completion block.** This simultaneously fixes the founder's space complaint, raises information density, and captures the highest-intent conversion moment — in one coordinated `/updates` pass (Wave E1+#6).
