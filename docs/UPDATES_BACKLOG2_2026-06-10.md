# Consolidated /updates Backlog — Round 2 (2026-06-10)

Goal: take the now-shipped /updates daily briefing (Wave A foundation + pipeline hardening + Wave B daily-habit hooks all live) to the **next tier**. Consolidated by coordinator from five parallel round-2 reviews:
- `UPDATES_REVIEW2_FRONTEND_2026-06-10.md`
- `UPDATES_REVIEW2_UX_2026-06-10.md`
- `UPDATES_REVIEW2_PM_2026-06-10.md`
- `UPDATES_REVIEW2_COMPETITIVE_2026-06-10.md`
- `UPDATES_REVIEW2_ANALYTICS_2026-06-10.md`

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (1–5 each).

---

## The convergent finding

The pipeline is now data-rich and reliable, so **the next tier of value is presentation, distribution, and accountability — not data**. Three themes surfaced independently across multiple lenses:

1. **The briefing has zero visual layer** — it's all text. Score-over-time sparklines / a "Chart of the Day" (Frontend C3 + UX + Competitive C2) is the single biggest experiential gap, and the history data (`site/public/data/history/<slug>.json`) already exists.
2. **`forwardTriggers[]` and `methodologyNotes[]` vanish each day** — turning them into persistent ledgers (a predictions/track-record ledger + a methodology changelog) creates a falsifiable accountability moat **no competitor has** (PM #1/#2 + Competitive C1/C4).
3. **Wave B added rich interactions but zero instrumentation** — the ReadingProgress bar, copy-citation button, and jump-nav are uninstrumented, so we can't tell a bounce from a full read or which content resonates (Analytics, the whole feedback loop).

---

## Ranked backlog (deduped across lenses)

| # | Item | Lens(es) | Type | Score | Effort |
|---|------|----------|------|-------|--------|
| 1 | **Engagement instrumentation**: `briefing_read_depth` (25/50/75/90%), `briefing_citation_copied`, `briefing_section_nav` | Analytics (triple) | improvement | **16** | Low |
| 2 | **Forward-Trigger ledger + CreditWatch-style countdown** (`/updates/forward-watch`; per-entity "Scoring Outlook") — accountability moat, drives return | PM+Competitive | new-feature | **15** | Med |
| 3 | **Score-over-time sparklines / "Chart of the Day"** (inline SVG from existing history JSON; band boundaries + crossings) — the missing visual layer | Frontend+UX+Competitive (triple) | new-feature | **14** | Med |
| 4 | **Methodology track-record / living changelog** (`/methodology/changelog` + track-record from resolved triggers) | PM+Competitive | new-feature | **14** | Med |
| 5 | **Band-distribution bar in header** (1,160 entities across 5 bands — "what the benchmark looks like now", great on quiet days) | UX | improvement | **14** | Low |
| 6 | **Evidence/interpretation separation** in score-change cards ("what the evidence shows" vs "what we concluded") — independence-strengthening | PM | improvement | **13** | Med |
| 7 | **Per-day OG image** (Cloudflare Worker `/og/updates/:date` → Satori PNG; point `og:image` at it) — shareability | Frontend+Competitive | improvement | **12** | Med |
| 8 | **Quiet-day reframing** (map `pipeline.cycleType` to a human label above the fold; replace grey "no movement" placeholder) | UX | improvement | **12** | Low |
| 9 | **"Since your last visit" tab signals** (amber/blue dots on date tabs for score-change vs methodology days) | UX | improvement | **11** | Low |
| 10 | **Reduced-motion + a11y** (guard global `scroll-behavior: smooth`, ReadingProgress transition, `<details>` chevron with `motion-safe:`) | Frontend | tech-debt | **10** | Trivial |
| 11 | **BriefingJumpNav IntersectionObserver dep-array/stale-closure fix** | Frontend | tech-debt | **10** | Trivial |
| 12 | **Remove dead code** `DailyBriefing.legacy.tsx` (~2,166 lines) + dedupe ~4× `entityHref`/`resolveSlugHref` | Frontend | tech-debt | — | Low |
| 13 | **Follow an entity / sector alerts** (Worker KV `followers:{slug}` → targeted nightly alert; Score-Watch upsell) | Competitive | new-feature | **9** | High |

## Recommended sequencing (Wave C → D)

**Wave C — instrument + the marquee visual/accountability (highest convergence, mostly data already present):**
- #1 Engagement instrumentation (trivial, unlocks the whole feedback loop — do first)
- #3 Score-over-time sparklines / Chart of the Day (the missing visual layer)
- #2 Forward-Trigger ledger + countdown (unique accountability moat)
- #10 + #11 tech-debt a11y/bug fixes (cheap, ride along)

**Wave D — depth, trust, distribution:**
- #4 Methodology changelog + track-record · #6 Evidence/interpretation separation · #7 per-day OG image · #5 band-distribution bar · #8 quiet-day reframing · #9 tab signals · #12 dead-code cleanup · #13 follow-an-entity.

## Independence check
All items PASS. #6 (evidence/interpretation), #2 & #4 (forward-trigger & track-record ledgers) actively **strengthen** independence (auditable evidence→score chain; the benchmark's own calls made falsifiable). #13 requires a disclosure ("following an entity does not affect its score or priority").

## Cross-cutting enabler
The history JSON (`site/public/data/history/<slug>.json`) and the briefing's `forwardTriggers`/`methodologyNotes`/`cycleType` fields are the shared substrate for items #2, #3, #4, #5, #8 — the data is already there; this wave is about surfacing it.
