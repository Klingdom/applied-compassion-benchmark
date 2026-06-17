# Home Page — Complete Assessment + 20 Best Improvements (2026-06-17)

Consolidated from five lenses: knowledge (`HOMEPAGE_REVIEW_KNOWLEDGE_*`), UX (`HOMEPAGE_REVIEW_UX_*`), conversion (`HOMEPAGE_REVIEW_CONVERSION_*`), graphics (`HOMEPAGE_REVIEW_GRAPHICS_*`), SEO/AEO (`HOMEPAGE_REVIEW_SEO_*`). Founder's three goals: **G1 knowledge acquisition · G2 understand the methodology · G3 view the daily briefing.**

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**.

---

## Complete assessment — the convergent diagnosis
The home has the right *material* but mis-orders and under-teaches it, and the one living, magnetic asset is broken. Three findings recur across nearly every lens:

1. **The daily briefing (G3) is buried AND conditionally invisible — a real bug.** "Today's research" sits ~4–5 sections down and is gated on `scoreChangesArr` (`page.tsx:203`), which reads `updates.scoreChanges` — a field the current briefing schema **no longer emits**. On a zero-proposal day (the most common, and often the most interesting — "1,160 scanned, all held"), the section's flagship cards render empty or the section can vanish, taking the briefing link with it. The freshest, most trust-building thing the institution makes is the hardest to find.
2. **The home shows band charts (S3 master bar + 7 small-multiples) but never teaches what the bands/dimensions MEAN (G1/G2).** The bar's own legend labels the *ranges* (Critical 0–20…), but the rich `ScoreLegend` (band descriptions + 8-dimension glossary) and the `DimensionRadar`/`DimensionLegend` framework primitives — all already built — are **not on the home at all**. A newcomer is shown a chart they were never taught to read, and "institutional compassion" + the 8 dimensions are never defined.
3. **The entity count is inconsistent** — 1,155 / 1,156 / ~1,160 / 1,160 all appear on one scroll. A citable-fact integrity risk on the most-cited page.

Plus: the hero leads with framework jargon (not a benefit or a definition) and a commercial "Purchase Research" CTA; the richest teaching panel sits at position ~8 of 12 (after the charts that need it); and the home is not a clean *answer surface* for "what is the Compassion Benchmark?" (no liftable definition, no `WebSite`/`FAQPage` JSON-LD).

**Single highest-leverage move:** ship the reuse-only comprehension+briefing fix — make the briefing teaser **always-on + headline-led (#1)**, drop **`ScoreLegend` under the master bar (#5)**, and add the **dimension-radar framework primer (#6)** — then reorder so teaching precedes the charts. Mostly reuse + a bug fix; low risk; hits all three goals.

---

## The 20 — ranked within each goal

### G3 — View the daily briefing (most broken; convergent across all 5 lenses)
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 1 | **Fix the briefing-teaser bug + make it ALWAYS-ON** — stop gating on the no-longer-emitted `scoreChanges` array; lead with the real `headline`; fall back to `topSignals`/`recentAssessments`; show "1,160 scanned · N assessed · 0 changes — all confirmed" on quiet days (rigor, not emptiness). Keep red/green strictly delta-driven so quiet days read "confirmed," not alarm. | conv #1, ux #1/#8, know #5, seo #5, dataviz G3 | S | **18** |
| 2 | **Elevate "Today's briefing" to section 2 + a hero teaser** with the real headline as the hook and **"Read today's briefing →" as a prominent primary action**. | ux #1, conv #2 | S–M | **16** |
| 3 | **Surface the real headline untruncated + relabel "Today's research" → "Today's briefing · {date}"; collapse the duplicate /updates CTAs into one benefit-framed primary.** | conv #3/#4, know #6 | S | **13** |
| 4 | **Tease the briefing's living data with a graphic** — `BandPositionStrip` on today's lead signal (and/or a 30-day `CompositeSparkline` of recent movement, gated to honest series length). | dataviz G3/G4 | S–M | **11** |

### G2 — Understand the methodology
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 5 | **Drop `ScoreLegend` (band meanings + 8-dim glossary) under the master bar** — the home's most-viewed graphic shows bands the reader was never taught; the component exists, is server-rendered + crawlable, unused on the home. | know #1, dataviz G2 | XS | **18** |
| 6 | **Add a dimension-radar + `DimensionLegend` "framework primer"** near the top (reuse `DimensionRadar` framework mode) — makes "what are the 8 dimensions" instantly legible; doesn't duplicate the flagship/distribution callout. | dataviz G1, know #3 | S | **15** |
| 7 | **Move the "How the benchmark works" panel up** (from ~§8 to §3) so the framework is explained *before* the charts that use band terms. | ux #2 | S | **13** |
| 8 | **"How an entity is scored" micro-teaser** — substantiate the "difficult to fake" claim; the plain integration-premium one-liner (`INTEGRATION_PREMIUM.short`) + a link to /methodology. | know #7 | S | **11** |

### G1 — Knowledge acquisition
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 9 | **One-sentence "institutional compassion" definition in the hero** — the core construct is gestured at but never defined. | know #2, conv #7 | XS | **16** |
| 10 | **Rewrite the hero subhead benefit-first** ("score how ~1,160 governments, companies, AI labs & cities recognize and reduce suffering — re-examined every weekday, sourced, free") — replaces framework jargon; states scope + cadence + cost. | conv #7, ux | S | **13** |
| 11 | **Gloss the 8 dimensions where named** (reuse `DimensionLegend`/`DIMENSION_MEANINGS`) — names without meanings teach nothing. | know #3 | XS | **12** |
| 12 | **De-jargon + connect the flagship-callout stats** ("modal", "90.5% equity gap") to the master bar; define them inline. | know #4, ux | S | **11** |
| 13 | **One-line "how to read" + a one-line takeaway per small-multiple; suppress the 7 redundant per-card legends** (one shared legend). | know #10 | S | **10** |
| 14 | **Elevate the Independence statement into the hero** (one line) — the top trust signal, currently buried ~§8. | ux #7 | XS | **11** |

### Cross-cutting — structure, integrity, answer-surface
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 15 | **Reconcile the entity count to ONE canonical figure** across hero/flagship/latest (1,155 vs 1,156 vs 1,160) — citable-fact integrity. | know #8, seo #3 | S | **14** |
| 16 | **Answer-first "What is the Compassion Benchmark?" block + home `FaqJsonLd`** — a liftable "X is Y" definition + 3–4 real FAQ Qs (reuse the existing `FaqJsonLd`); wins AI Overviews + human comprehension. | seo #1, know #2 | S | **14** |
| 17 | **Add `WebSite` + `SearchAction` JSON-LD (a `@graph` in layout)** — sitelinks search box + entity identity (Pagefind search is real, so it's honest). | seo #2 | S | **11** |
| 18 | **Trim/merge redundancy + reorder for flow:** merge the flagship Callout + master bar into one "state of the field" block; move the small-multiples *after* the methodology panel; personas before services; **drop "Purchase Research" from the hero**; make hero index rows clickable (trim the duplicate index grid). | ux #3/#4/#5/#6/#10, conv #2 | M | **12** |
| 19 | **Re-place the newsletter to the post-briefing intent peak** (card variant, "Liked today's briefing? Get the Friday email — free") + convert the **final CTA into the daily-habit close** (not "Explore Indexes / Contact Sales"). | conv #5/#6, ux #9 | S | **11** |
| 20 | **Define pipeline vocabulary** (scanned/assessed/changes — so "0 changes" reads as rigor) + **add home links to `/about` and the dated latest briefing** (`/updates/<date>`). | know #9, seo #4 | S | **10** |

---

## Recommended "do-first" wave (reuse + reorder + one bug fix; low risk, hits all 3 goals)
**#1** (briefing always-on bug fix) · **#5** (`ScoreLegend` under the master bar) · **#6** (dimension-radar primer) · **#9** (define "institutional compassion" in the hero) · **#2** (elevate the briefing + hero teaser) · **#15** (reconcile the entity count). Almost entirely existing components + copy + ordering — no new infrastructure.

## Independence / integrity
All 20 PASS: own-data visuals (CC-BY), no dark patterns (the conversion lens confirmed none; keep red/green delta-driven), no fabrication (FAQ + definitions trace to real data; `sameAs`/counts use real values). Several moves *strengthen* the independence read (demoting "Purchase Research" in the hero, elevating the no-pay-for-rankings statement).

## Founder-gated (noted, not in the 20)
Root `Organization.sameAs` needs your real verified profile URLs (SEO #7) — don't guess.
