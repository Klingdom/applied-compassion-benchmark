# Indexes Hub (/indexes) — Complete Assessment + 20 Best Improvements (2026-06-17)

Consolidated from five lenses: knowledge (`INDEXES_REVIEW_KNOWLEDGE_*`), UX (`INDEXES_REVIEW_UX_*`), conversion (`INDEXES_REVIEW_CONVERSION_*`), graphics (`INDEXES_REVIEW_GRAPHICS_*`), SEO/AEO (`INDEXES_REVIEW_SEO_*`). Founder's three goals: **G1 knowledge acquisition · G2 understand the methodology · G3 view the daily briefing.** Surface: `site/src/app/indexes/page.tsx` (+ `EntitySearch`, `PickEntityCallout`, the card grid).

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**.

---

## Complete assessment — the convergent diagnosis
The `/indexes` hub routes to 7 well-built index pages (G1 gave them superlative titles + answer blocks + FAQPage), but the **hub itself is the weakest teacher, the weakest answer surface, and a storefront more than a research hub** — and it has a correctness bug. Findings recurring across nearly every lens:

1. **🔴 Correctness bug: the index grid shows only 5–6 of the 7 indexes.** **U.S. Cities (144) and Global Cities (250) are absent** from the "Current indexes" grid, while "Assess Your Organization" (not an index) sits *in* it. The page claims "7 index families" but misrepresents coverage and omits ~394 entities' entry points. [SEO, knowledge, UX — convergent]
2. **🔴 The daily briefing (G3) has ZERO presence on the hub.** `/updates` is linked nowhere in the page body (only the global navbar). The strongest free, repeat-visit asset is entirely absent from the hub. [conversion P16, UX, knowledge, graphics, SEO — convergent, the most-neglected goal]
3. **No schema teaching (G1/G2).** The hub never defines a score/band/dimension; `ScoreLegend`, `DimensionLegend`, `BandDistributionBar` all exist and are unused here — so the composite+band shown in `EntitySearch` results and on every card is unreadable without leaving the page. [knowledge P18, graphics, UX — convergent]
4. **Cards are undifferentiated word-cards (G1).** No entity count, no band distribution, no reason-to-click; the HOME page is more informative about the indexes than the hub. The card copy even implies each index uses *different* criteria — miseducating about the shared-ruler comparability story. [UX, graphics, knowledge, conversion — convergent]
5. **Methodology is buried (G2).** One footer-style text link, equal visual weight to "Contact Sales." [UX, knowledge, conversion, SEO — convergent]
6. **Commerce is front-loaded over reader value.** ~4–5 of ~9 sections are commercial and arrive before the reader learns what's measured; the hero "How to use the indexes" panel still reads as a buyer table (message-match issue, not a dark pattern). [conversion, UX, knowledge]
7. **Weakest answer surface on the site:** zero JSON-LD, title is just "Indexes," no extractable "what does the benchmark rank" sentence, stale hardcoded 1,155 count (3 places). [SEO]

**Single highest-leverage move:** the reuse-heavy comprehension+briefing+correctness wave — **fix the 7-index grid (#1)**, add the **"how to read every index" teaching block (#4)**, add a **daily-briefing on-ramp (#5)**, and a **cross-index ranked mean-bars hero visual (#10)**. Mostly reuse of shipped primitives + one bug fix; hits all three goals and corrects a coverage misstatement.

---

## The 20 — ranked within each group

### Correctness + G3 (daily briefing — most neglected; convergent)
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 1 | **Fix the index grid to show ALL 7 indexes** — add U.S. Cities + Global Cities; move "Assess Your Organization" out of the grid (it's a service, not an index). Correctness/coverage fix. | SEO, know #4, UX #5 | XS | **17** |
| 2 | **Add a prominent daily-briefing on-ramp** — a "Read today's briefing" strip with the live date + the headline/1–2 signals from `latest.json` + a link to `/updates` (currently zero hub presence). | conv #1, UX #3, know #3, graphics #4 | S | **16** |
| 3 | **Add `/updates` (+ /media, /data) to the hub's link panel** (one-liners; currently absent from the body). | UX #7, SEO #4 | XS | **12** |
| 4 | **Live briefing tease graphic** — latest delta chips / movement (reuse the home's briefing markup), proving the benchmark is alive. | graphics #4 | S | **10** |

### G2 — Methodology
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 5 | **"How to read every index" teaching block** — `DimensionLegend` + `ScoreLegend`, framed as the SAME 8-dimension / 0–100 / 5-band ruler across all 7 indexes (reuse; pulls from `dimensions.ts`). Makes the search results + every card + all 7 spokes legible. | know #1, graphics #3 | XS | **18** |
| 6 | **Promote Methodology to a real on-ramp** — a hero/near-top descriptive invitation, not a footer text link equal to "Contact Sales." | UX #4, know #6, conv #6, SEO #5 | S | **13** |
| 7 | **Decode framework jargon inline in the index cards** (what composite/band/dimension mean where shown). | know #7 | S | **10** |

### G1 — Knowledge acquisition
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 8 | **Cross-index "state of the field" ranked mean bars (hero)** — all 7 indexes' `meta.meanScore` on one band-colored 0–100 axis, sorted high→low (reuse `GroupMeanBars` with a 7-row array). The only cross-index ranked comparison on the site; the choose-an-index decision instrument. | graphics #1 | S | **15** |
| 9 | **Per-card band mini-strip + band-colored mean badge** — turn identical word-cards into self-describing previews (Countries reads red, Robotics green) via `BandDistributionBar` `counts` from `meta.bands[]`. | graphics #2, UX #1 | S | **14** |
| 10 | **Give each card a reason-to-click** — entity count + a one-line differentiator/finding + an explicit "View index →" affordance. | UX #1/#6, conv #5, know #4 | S | **13** |
| 11 | **Tell the cross-type comparability story** — "all 1,156 entities — governments, companies, AI/robotics labs, cities — on one 8-dimension ruler"; fix card copy that implies different criteria. | know #2, SEO | S | **13** |
| 12 | **Rewrite the hero lead visitor-first** ("compare how institutions across sectors recognize and reduce suffering — free") not product-position language. | UX #10, know #5, conv #2 | S | **11** |
| 13 | **Per-index coverage counts** (207 countries, 448 F500, 50 AI labs, …) on cards or hero. | UX #9 | XS | **10** |

### Structure / answer-surface / trust
| # | Improvement | Lens(es) | Effort | Priority |
|---|-------------|----------|--------|----------|
| 14 | **Reorder: teaching + the 7-index grid BEFORE commerce** — move the grid to section 2; rebalance the commercial blocks below free value. | UX #2, know #8, conv #7 | S | **13** |
| 15 | **Replace/relabel the hero "How to use the indexes" buyer table** with true reader paths (browse · understand the method · read today's briefing). | conv #4, UX #8 | S | **12** |
| 16 | **`CollectionPage` + `ItemList` JSON-LD over the 7 indexes** — the hub emits zero JSON-LD; this binds hub→spokes→institution (top AEO unlock here). | SEO #2 | S | **12** |
| 17 | **Title + description + answer-first lead sentence** — title is just "Indexes"; add a liftable "what the benchmark ranks" sentence + the cross-sector scope. | SEO #3 | XS | **12** |
| 18 | **`BreadcrumbList` + `FAQPage` (visible accordion)** for the hub's cross-cutting questions (reuse the shipped `BreadcrumbJsonLd`/`FaqJsonLd`/`FaqAccordion`). | SEO #4 | S | **11** |
| 19 | **Reconcile/derive the entity count** — replace the stale hardcoded 1,155 (3 places) with the canonical 1,156, derived from data. | SEO #6, UX #9 | XS | **11** |
| 20 | **Move `EntitySearch` up + add free follow-on links** (post-search footer is currently commerce-only) — make fast lookup prominent. | conv #3, UX | S | **10** |

---

## Recommended "do-first" wave (reuse + one bug fix + reorder; low risk; all 3 goals)
**#1** (fix the 7-index grid — correctness) · **#5** (the teaching block — top knowledge, reuse) · **#2** (daily-briefing on-ramp — most-neglected goal) · **#8** (cross-index ranked mean bars — the choose-an-index instrument, reuse `GroupMeanBars`) · **#9** (per-card band strips, reuse `BandDistributionBar`) · **#19** (canonical count). Almost entirely shipped components + copy + the grid fix.

## Independence / integrity
All 20 PASS: own-data visuals (CC-BY), no dark patterns (conversion lens confirmed; the "buyer table" is a message-match fix, not a dark pattern), no fabrication. Several moves *strengthen* the research-hub-over-storefront posture (leading with free briefing + teaching, demoting commerce).

## Founder-gated
None blocking — all 20 are buildable. (Root `Organization.sameAs` remains a separate founder item, not part of this hub work.)
