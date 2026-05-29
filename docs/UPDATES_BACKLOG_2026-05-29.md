# Consolidated /updates + Daily Briefing Backlog — 2026-05-29

Goal: make /updates a **world-class daily go-to destination**. Consolidated by coordinator from five parallel specialist reviews:
- `UPDATES_REVIEW_PM_2026-05-29.md` (product / IA / content structure)
- `UPDATES_REVIEW_UX_2026-05-29.md` (reading experience)
- `UPDATES_REVIEW_COMPETITIVE_2026-05-29.md` (daily-product format benchmark)
- `UPDATES_REVIEW_GROWTH_2026-05-29.md` (daily-habit / distribution)
- `UPDATES_REVIEW_FRONTEND_2026-05-29.md` (implementation audit)

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (each 1–5).

---

## Two convergent findings (read first)

**A. The briefing buries its best content and has no 5-second value.** PM, UX, and Competitive independently produced the *same #1 idea*: a returning reader sees pipeline process-stats and a long scroll, not "what happened today." The synthesis (highlights, sector trends, emerging risks) sits at sections 12–14 of a 17-section page. Fix = above-the-fold value + synthesis-before-raw-data.

**B. The foundation has live, credibility-damaging bugs.** A "world-class" claim is undercut by what's broken *right now*:
- On **60% of briefings the `topSignals` data is absent**, so the top third of the page silently collapses and the hero **"Read today's brief" CTA links to a `#signals` anchor that doesn't exist** (Frontend C4).
- **20+ score-change cards render with empty headline/evidence** — named cards with no explanation, contradicting the evidence-first brand (PM).
- **RSS/JSON feed descriptions serialize as "0 entities"** — journalists/aggregators see nothing worth clicking (Growth).
- **Subscribe box advertises "Friday mornings, one email"** on a *daily* briefing — cadence mismatch suppressing opt-ins (Growth).
- **Blank social unfurls** — no per-day OG image/metadata, so every shared link looks generic (Frontend + Growth).
- **No canonical URLs** on /updates or /updates/[date] (Frontend).

**Strategic conclusion:** Fix the embarrassing foundation (Wave A) before layering best-in-class mechanics (Wave B/C). Several Wave-A items are trivial effort and high impact.

---

## Ranked backlog (deduped across lenses)

| # | Item | Lens(es) | Type | Score | Effort |
|---|------|----------|------|-------|--------|
| 1 | **Above-the-fold "5-second value": Today-in-Brief + Stat of the Day** (one lead finding + one shareable number, before the scroll) | PM+UX+Competitive (triple) | new-feature | **15** | Low |
| 2 | **Fix SubscribeCTA cadence mismatch** ("daily" not "Friday weekly") — primary capture surface | Growth | fix | **15** | Trivial |
| 3 | **Per-briefing OG image + OpenGraph/Twitter metadata** (shareable unfurls; build-time PNG per day) | Frontend+Growth+Competitive (triple) | improvement | **14** | Med |
| 4 | **Enrich RSS/JSON feed descriptions** (use `summary`/lead headline, date-prefixed titles) | Growth | fix | **14** | Low |
| 5 | **Reorder sections: editorial synthesis before raw score-change detail** | PM | improvement | **13** | Low |
| 6 | **Evidence/interpretation separation in score cards** ("What the evidence shows" vs "What we concluded") — strengthens independence | Competitive | improvement | **13** | Med |
| 7 | **Fix empty `topSignals` render path + dead hero CTA + filter empty score-cards** (LIVE BUG on ~60% of briefings) | Frontend+PM | fix | **12** | Low |
| 8 | **Canonical URLs** on /updates and /updates/[date] | Frontend | fix | **11** | Trivial |
| 9 | **Persistent in-page jump nav + finishability/progress** (15+ sections, no wayfinding) | UX+Competitive | improvement | **11** | Med |
| 10 | **Collapsible "audit trail"** (confirmations, math-hygiene, holds behind a disclosure; CTA where readers finish) | UX | improvement | **11** | Low |
| 11 | **"One source on the ground"** — one cited human quote per briefing, linked to the entity | Competitive | new-feature | **10** | Med |
| 12 | **"Cite this" / share buttons** on briefing + score cards (zero-friction citation) | Competitive+Growth | improvement | **9** | Med |
| 13 | **Remove `DailyBriefing.legacy.tsx` (2,200 lines dead) + dedupe 4× `resolveSlugHref`** | Frontend | tech-debt | — | Low |

> Note: items #7, #4, #3, #2, #8 score below #1 but are **broken-foundation fixes** — they should lead the sequence because they actively make the site look un-finished today.

## Recommended sequencing (3 waves)

**Wave A — Fix the broken foundation (mostly trivial/low effort, high credibility return):**
#7 empty-render/dead-CTA + empty-card filter · #2 subscribe cadence · #4 feed descriptions · #8 canonicals · #3 per-day OG metadata (image can follow). *Root-cause note: #7 and the empty cards originate in the digest pipeline emitting incomplete `topSignals`/headlines — fix the frontend fallback now, and harden the pipeline as a follow-up.*

**Wave B — The daily-habit hooks (make people return):**
#1 above-the-fold 5-second value (Today-in-Brief + Stat of the Day) · #5 synthesis-first reorder · #9 jump nav + finishability · #10 collapsible audit trail.

**Wave C — Best-in-class craft:**
#6 evidence/interpretation separation · #11 ground voice · #12 cite/share · #13 dead-code cleanup.

## Independence check
All items PASS. #6 and #11 *strengthen* independence (auditable evidence→score chain; quotes only from cited public sources, never compensated). No item introduces entity-pays dynamics.

## Cross-cutting root cause to address
Items #7 and the empty score-cards trace to the **digest pipeline emitting incomplete `topSignals`/`headline` fields** on many days. Frontend fallbacks fix the symptom; a digest-agent hardening pass (guarantee a synthesized lead + non-empty headlines, plus a lint rule) fixes the cause. Recommend pairing the Wave-A frontend fallback with a pipeline follow-up.
